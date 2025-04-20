"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { useSearchParams } from "next/navigation"
import { Copy, Check } from "lucide-react"

export default function Page2() {
  const searchParams = useSearchParams()
  const phone = searchParams.get("phone") ?? ""
  const cleanPhone = phone.replace(/\D/g, "")
  const whatsappUrl = `https://wa.me/${cleanPhone}`

  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedQR, setCopiedQR] = useState(false)

  const copyToClipboard = (text: string, setCopied: (value: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const isPhoneValid = !!cleanPhone

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#E4D5C1] p-4">
      {!isPhoneValid ? (
        <p className="text-[#FCA311] text-lg font-semibold">
          Número de teléfono no válido.
        </p>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-[#11295B] text-center mb-6">
            Envía un mensaje al instante
          </h1>

          <div className="flex items-center gap-2 mb-4">
            <Button
              className="bg-[#FCA311] hover:bg-[#11295B] text-black px-6 py-2 border border-white"
              onClick={() => window.open(whatsappUrl, "_blank")}
            >
              Inicia la conversación
            </Button>
            <Button
              className="border border-[#11295B] text-[#11295B] bg-[#FCA311] hover:#FCA311"
              onClick={() => copyToClipboard(whatsappUrl, setCopiedLink)}
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          <p className="text-lg text-center text-[#11295B] mb-4">Escanea el código QR</p>

          <div className="flex flex-col items-center gap-2 bg-white p-4 rounded-lg shadow-md">
            <QRCodeSVG value={whatsappUrl} size={200} />
            <Button
              className="border border-[#11295B] text-[#11295B] bg-[#FCA311] hover:white"
              onClick={() => copyToClipboard(whatsappUrl, setCopiedQR)}
            >
              {copiedQR ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span className="ml-2">Copiar enlace del QR</span>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
