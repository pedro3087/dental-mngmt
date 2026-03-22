'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRef, useEffect, useState } from 'react'
import { Bot, Send, User, GripHorizontal, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const DEFAULT_QUICK_PROMPTS = [
  'Dame un resumen del último expediente revisado',
  'Estadísticas de ausentismo del mes',
  '¿Cuántas facturas están pendientes de cobro?',
]

export function DentistCopilot({ quickPrompts }: { quickPrompts?: string[] }) {
  const prompts = quickPrompts?.filter(p => p.trim()).length
    ? quickPrompts.filter(p => p.trim())
    : DEFAULT_QUICK_PROMPTS
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  function handleQuickPrompt(text: string) {
    sendMessage({ text })
  }

  function getMessageText(parts: { type: string; text?: string }[]) {
    return parts.filter(p => p.type === 'text').map(p => p.text ?? '').join('')
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden h-full flex flex-col relative shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm z-10">
        <h3 className="text-xl font-bold flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          Copiloto Clínico (RAG)
        </h3>
        <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Vercel AI SDK
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 z-10">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              Hola Doctor. Soy tu Copiloto Clínico IA. Pregúntame sobre expedientes, estadísticas o tratamientos.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const text = getMessageText(msg.parts as { type: string; text?: string }[])
          if (!text || msg.role === 'system') return null
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-gray-800 text-gray-200 rounded-tl-sm border border-gray-700/50'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{text}</p>
              </div>
              <span className="text-[10px] text-gray-500 mt-2 font-medium uppercase tracking-wider flex items-center gap-1">
                {msg.role === 'user' ? (
                  <><User className="w-3 h-3" /> Tú</>
                ) : (
                  <><Bot className="w-3 h-3 text-blue-400" /> Copiloto AI</>
                )}
              </span>
            </motion.div>
          )
        })}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-2 max-w-[85%] mr-auto p-4 rounded-2xl bg-gray-800 rounded-tl-sm border border-gray-700/50 text-gray-400 w-fit"
          >
            <Bot className="w-4 h-4 text-blue-500 animate-pulse" />
            <span className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </motion.div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 border border-red-800/30 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error.message?.includes('OPENROUTER') ? 'Configura OPENROUTER_API_KEY en .env.local para activar la IA.' : error.message}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-900/80 backdrop-blur-md border-t border-gray-800/50 z-10">
        <div className="flex justify-center gap-2 mb-3 flex-wrap">
          {prompts.map(p => (
            <button
              key={p}
              onClick={() => handleQuickPrompt(p)}
              disabled={isLoading}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition-colors disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <GripHorizontal className="absolute left-4 w-5 h-5 text-gray-600" />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Pregunta a tu asistente clínico..."
            className="w-full bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 rounded-2xl shadow-inner focus:ring-blue-500 focus:border-blue-500 sm:text-sm pl-12 pr-14 py-4"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl transition-colors shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
