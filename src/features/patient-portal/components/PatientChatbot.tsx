'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, UIMessage } from 'ai'
import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot } from 'lucide-react'

interface PatientChatbotProps {
  patientName?: string
  treatmentTitle?: string
  nextAppointment?: string
}

const WELCOME_MESSAGE: UIMessage = {
  id: 'welcome',
  role: 'assistant',
  parts: [{ type: 'text', text: '¡Hola! Soy tu asistente de VitalDent. ¿Tienes alguna duda sobre tu tratamiento o próxima cita?' }],
}

export function PatientChatbot({ patientName, treatmentTitle, nextAppointment }: PatientChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const welcomeMsg: UIMessage = {
    id: 'welcome',
    role: 'assistant',
    parts: [{ type: 'text', text: `¡Hola${patientName ? ` ${patientName}` : ''}! Soy tu asistente de VitalDent. ¿Tienes alguna duda sobre tu tratamiento o próxima cita?` }],
  }

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/patient-chat',
      body: { patientName, treatmentTitle, nextAppointment },
    }),
    messages: [welcomeMsg],
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, isOpen])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  function getMessageText(parts: { type: string; text?: string }[]) {
    return parts.filter(p => p.type === 'text').map(p => p.text ?? '').join('')
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 lg:right-10 w-14 h-14 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 lg:right-10 w-[90vw] max-w-sm h-[500px] bg-white rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.15)] flex flex-col overflow-hidden z-50 border border-gray-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">VitalDent Assistant</h3>
                  <p className="text-pink-100 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> En línea
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 space-y-4">
              {messages.map((msg) => {
                const text = getMessageText(msg.parts as { type: string; text?: string }[])
                if (!text || msg.role === 'system') return null
                return (
                  <div key={msg.id} className={`flex max-w-[85%] ${msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
                    <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-pink-500 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                      <p className="whitespace-pre-wrap">{text}</p>
                    </div>
                  </div>
                )
              })}

              {isLoading && (
                <div className="flex items-center gap-2 max-w-[85%] mr-auto p-3 rounded-2xl bg-white border border-gray-100 rounded-tl-sm w-fit shadow-sm">
                  <Bot className="w-4 h-4 text-pink-500 animate-pulse" />
                  <span className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 shrink-0 flex items-center gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Escribe tu duda médica..."
                className="flex-1 bg-gray-50 border border-gray-200 text-sm rounded-full px-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white rounded-full flex items-center justify-center shrink-0 shadow-md transition-colors"
              >
                <Send className="w-4 h-4 -ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
