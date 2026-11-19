import { NextResponse } from 'next/server'
import axios from 'axios'
import { LOCAL_APP_API_KEY } from '@/app/types/hotelData'

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const response = await axios.post(
            'https://apps.hotellepays.com/api/chatbot',
            {
                ...body,
                local_app_api_key: LOCAL_APP_API_KEY, // Utilise ta clé API
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 15000,
            }
        )

        return NextResponse.json(response.data)
    } catch (error: any) {
        // Log détaillé de l'erreur
        console.error('[API Chatbot Error]', error?.response?.data || error.message)

        // Renvoyer les détails de l'erreur dans la réponse
        return NextResponse.json(
            { error: 'Chatbot API error', details: error?.response?.data || error.message },
            { status: 500 }
        )
    }
}
