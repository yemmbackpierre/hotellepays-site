'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';  // Importer Axios
import { Canvas } from '@react-three/fiber';
import { MessageCircle, X, Send } from 'lucide-react';
import { useDailyAvatar } from "@/app/hooks/useDailyAvatar";
import { Avatar3D } from "@/app/components/chatbot/Avatar3D";
import { defaultContactInfos } from "@/app/types/hotelData";
import { v4 as uuidv4 } from 'uuid';

// Définir un type réutilisable pour les messages
type Message = { id: string; role: 'bot' | 'user'; content: string };

export default function Chatbot() {
    const use3DAvatar = false; // true pour 3D, false pour image
    const AVATAR_IMAGES = [
        "/assets/images/avatar/man.jpg",
        "/assets/images/avatar/woman.jpg"
    ];

    const avatarImage = useDailyAvatar({
        key: "chatbot-avatar",
        values: AVATAR_IMAGES
    });

    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>(() => [
        { id: uuidv4(), role: 'bot', content: "Bienvenue à l'Hôtel Le Pays. Comment puis-je vous aider aujourd'hui ?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Utilisation de useEffect pour gérer le token de session
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('chatbot-session-token') || uuidv4();
            setSessionToken(token);

            // Sauvegarder le token dans localStorage
            if (!localStorage.getItem('chatbot-session-token')) {
                localStorage.setItem('chatbot-session-token', token);
            }
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: uuidv4(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // Récupérer les liens de contact (téléphone et WhatsApp)
        const contactPhoneNumber = defaultContactInfos
            .filter(contact => contact.type === "phone")
            .map(contact => contact.value)
            .join(" ou ");

        const contactWhatsAppLink = defaultContactInfos
            .filter(contact => contact.type === "whatsapp")
            .map(contact => contact.link)
            .join(" ou ");

        // Créer le message d'erreur avec les liens de contact
        const errorMessage = `
        <p>Désolé ! 😞 Nous sommes débordés.</p>
        <p>Pour toute urgence, contactez-nous :</p>
        <ul>
            <li>📞 ${contactPhoneNumber}</li>
        </ul>
        <p>Ou via WhatsApp pour une réponse plus rapide :</p>
        <ul>
            <li>💬 <a href="${contactWhatsAppLink}" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
        </ul>
        <p>Merci pour votre patience ! 🙏</p>
    `;

        try {
            // Appel API vers endpoint PHP (compatible Apache) placé dans /public/chatbot.php
            const res = await axios.post('/chatbot.php', {
                question: input,
                session_token: sessionToken,
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.data?.response) {
                const botMsg: Message = { id: uuidv4(), role: 'bot', content: res.data.response };
                setMessages(prev => [...prev, botMsg]);
            } else {
                console.log("[Chat] Réponse inattendue de l'API", res.data);
                const botMsg: Message = { id: uuidv4(), role: 'bot', content: "Désolé, je n'ai pas trouvé de réponse à votre question." };
                setMessages(prev => [...prev, botMsg]);
            }
        } catch (error: any) {
            // Affichage des détails de l'erreur dans la console pour le debugging
            console.error("[Chat Error] Détails de l'erreur :", error?.response?.data || error?.message);

            // Remplacer le message d'erreur par le message personnalisé avec les liens de contact
            const botMsg: Message = { id: uuidv4(), role: 'bot', content: errorMessage };
            setMessages(prev => [
                ...prev,
                botMsg
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: 100, right: 30, zIndex: 9999 }}>
            {/* Bouton flottant */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    backgroundColor: '#d50a0a',
                    color: 'white',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    border: 'none',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {isOpen ? <X size={30} /> : <MessageCircle size={30} />}
            </button>

            {/* Fenêtre de chatbot */}
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 80,
                        right: 0,
                        width: 350,
                        height: 500,
                        backgroundColor: 'white',
                        borderRadius: 15,
                        boxShadow: '0 15px 50px rgba(0,0,0,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        border: '1px solid #eee'
                    }}
                >
                    {/* HEADER AVEC AVATAR */}
                    <div
                        style={{
                            backgroundColor: '#d50a0a',
                            padding: 15,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12
                        }}
                    >
                        <div
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '2px solid #D4A373',
                                background: 'rgba(9,9,9,0.76)'
                            }}
                        >
                            {use3DAvatar ? (
                                <Canvas
                                    camera={{ position: [0, 1.6, 2.5], fov: 35 }}
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                                    {/* @ts-ignore */}
                                    <ambientLight intensity={1.2} />
                                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                                    {/* @ts-ignore */}
                                    <directionalLight position={[2, 5, 2]} intensity={1.5} />
                                    <Avatar3D />
                                </Canvas>
                            ) : (
                                <img
                                    src={avatarImage}
                                    alt="avatar"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            )}
                        </div>

                        <div>
                            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#ffffff' }}>
                                Hôtel Le Pays
                            </h4>
                            <span style={{ fontSize: 11, color: '#f3f194' }}>
                                ● Assistant en ligne
                            </span>
                        </div>
                    </div>

                    {/* MESSAGES */}
                    <div
                        ref={scrollRef}
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: 20,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 15,
                            backgroundColor: '#f9f9f9'
                        }}
                    >
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                style={{
                                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                    backgroundColor: m.role === 'user' ? '#D4A373' : 'white',
                                    color: m.role === 'user' ? 'white' : '#333',
                                    padding: '12px 16px',
                                    borderRadius: m.role === 'user' ? '15px 15px 0 15px' : '15px 15px 15px 0',
                                    maxWidth: '85%',
                                    fontSize: 14,
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                }}
                                dangerouslySetInnerHTML={{ __html: m.content }} // Affiche HTML si présent
                            />
                        ))}
                        {isLoading && (
                            <div style={{ fontSize: 12, color: '#999' }}>
                                L’assistant écrit…
                            </div>
                        )}
                    </div>

                    {/* INPUT */}
                    <div
                        style={{
                            padding: 15,
                            borderTop: '1px solid #eee',
                            display: 'flex',
                            gap: 10
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Posez votre question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            style={{
                                flex: 1,
                                border: 'none',
                                outline: 'none',
                                fontSize: 14
                            }}
                        />
                        <button
                            onClick={handleSend}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#D4A373',
                                cursor: 'pointer'
                            }}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
