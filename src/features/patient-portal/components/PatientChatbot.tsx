'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'

type Message = { id: number, text: string, sender: 'bot' | 'user' }

export function PatientChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: '¡Hola Carlos! Soy tu asistente de VitalDent. ¿Tienes alguna duda sobre tus alineadores o tu próxima cita?', sender: 'bot' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, isOpen])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMsg: Message = { id: Date.now(), text: input, sender: 'user' }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const userText = newMsg.text.toLowerCase()
      let reply = "He registrado tu pregunta y el equipo médico la revisará pronto. Tu próxima cita está confirmada para el 20 de Marzo."

      if (userText.includes('duele') || userText.includes('molestia')) {
        reply = "Es completamente normal sentir un poco de presión los primeros 2 días tras cambiar de alineador. Si el dolor es muy fuerte, por favor toma un analgésico de venta libre y contáctanos si no mejora."
      } else if (userText.includes('cita') || userText.includes('cuando')) {
        reply = "Tu próxima cita (Entrega de Alineadores 12-16) es el **20 de Marzo de 2026** a las 12:00 PM. Ya lo tengo agendado."
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, sender: 'bot' }])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <>
      {/* Botón Flotante */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 lg:right-10 w-14 h-14 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Ventana de Chat Flotante */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 lg:right-10 w-[90vw] max-w-sm h-[500px] bg-white rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.15)] flex flex-col overflow-hidden z-50 border border-gray-100"
          >
            {/* Header Chat */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">VitalDent Assistant</h3>
                  <p className="text-pink-100 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> En línea
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex max-w-[85%] ${msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
                  <div className={`p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-pink-500 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                     <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-center gap-2 max-w-[85%] mr-auto p-3 rounded-2xl bg-white border border-gray-100 rounded-tl-sm w-fit shadow-sm">
                  <Bot className="w-4 h-4 text-pink-500 animate-pulse" />
                  <span className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 shrink-0 flex items-center gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu duda médica..." 
                className="flex-1 bg-gray-50 border border-gray-200 text-sm rounded-full px-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
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
