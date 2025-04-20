"use client"

//import { useState } from "react"
import { Button } from "@/components/ui/button"

import { MessageCircle, } from "lucide-react"

interface ContactWhatsAppProps {
  phone: string
}

export default function ContactWhatsApp({ phone }: ContactWhatsAppProps) {
  
  const abrirNuevaPestana = () => {
    window.open(`/page2?phone=${phone}`,"_blank")
  }
  

  return (
    <div className="flex flex-col gap-2">
      <Button  className="w-full bg-[#FCA311] hover:bg-[#E4D5C1] text-#11295B" onClick={abrirNuevaPestana}>
        <MessageCircle className="mr-2 h-4 w-4" />
        WhatsApp
      </Button>
    </div>
  )
}