'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, GripHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'

type Message = { id: number, text: string, sender: 'ai' | 'doctor' }

const initialMessages: Message[] = [
  { id: 1, text: 'Hola Doctor. He analizado los últimos 50 expedientes de la semana. ¿Qué asistente necesitas hoy?', sender: 'ai' },
]

export function DentistCopilot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMsg: Message = { id: Date.now(), text: input, sender: 'doctor' }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    setIsTyping(true)

    // Simular RAG processing
    setTimeout(() => {
      const responsePrompt = newMsg.text.toLowerCase()
      let reply = "Acabo de revisar la base de datos anonimizada (Expedientes y NOM-013). Todo parece estar en orden."
      
      if (responsePrompt.includes('carlos') || responsePrompt.includes('mendoza')) {
        reply = "He extraído el historial de **Carlos Mendoza**. Tiene hipertensión controlada (Losartán 50mg). Su última cita fue hace 6 meses. Te sugiero confirmar su presión antes de administrar anestésicos con epinefrina."
      } else if (responsePrompt.includes('ausentismo') || responsePrompt.includes('citas')) {
        reply = "He detectado que el 80% de las inasistencias ocurren los jueves por la tarde. Sugiero lanzar una campaña de recordatorios de WhatsApp 48 horas antes para este bloque específico."
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, sender: 'ai' }])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden h-full flex flex-col relative shadow-2xl">
      {/* Background Decorativo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

      <div className="flex items-center justify-between p-6 border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm z-10">
        <h3 className="text-xl font-bold flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          Copiloto Clínico (RAG)
        </h3>
        <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          Conectado a DB
        </span>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6 z-10 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id} 
            className={`flex flex-col max-w-[85%] ${msg.sender === 'doctor' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
          >
            <div className={`p-4 rounded-2xl ${
              msg.sender === 'doctor' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : 'bg-gray-800 text-gray-200 rounded-tl-sm border border-gray-700/50'
            }`}>
              <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
            <span className="text-[10px] text-gray-500 mt-2 font-medium uppercase tracking-wider flex items-center gap-1">
              {msg.sender === 'doctor' ? (
                <><User className="w-3 h-3" /> Tú</>
              ) : (
                <><Bot className="w-3 h-3 text-blue-400" /> Copiloto AI</>
              )}
            </span>
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-2 max-w-[85%] mr-auto p-4 rounded-2xl bg-gray-800 rounded-tl-sm border border-gray-700/50 text-gray-400 w-fit"
          >
            <Bot className="w-4 h-4 text-blue-500 animate-pulse" />
            <span className="flex gap-1">
               <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
               <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
               <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-gray-900/80 backdrop-blur-md border-t border-gray-800/50 z-10">
        <div className="flex justify-center gap-2 mb-3">
          <button onClick={() => setInput('Resumen del expediente de Carlos Mendoza')} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition-colors">
            Resumen Carlos Mendoza
          </button>
          <button onClick={() => setInput('Muestra estadísticas de ausentismo del mes')} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition-colors">
            Estadísticas de ausentismo
          </button>
        </div>
        <form onSubmit={handleSend} className="relative flex items-center">
          <GripHorizontal className="absolute left-4 w-5 h-5 text-gray-600" />
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta a tu asistente clínico..." 
            className="w-full bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 rounded-2xl shadow-inner focus:ring-blue-500 focus:border-blue-500 sm:text-sm pl-12 pr-14 py-4"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl transition-colors shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
