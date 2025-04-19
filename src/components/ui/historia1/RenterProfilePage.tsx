import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Mail, Briefcase, Calendar, AlertCircle } from "lucide-react"
import ContactWhatsApp from "@/components/contact-whatsapp"
import RenterStats from "@/components/renter-stats"
import VerificationBadges from "@/components/verification-badges"
import RentalHistory from "@/components/rental-history"
import ReportRenter from "@/components/report-renter"
import CommentsSection from "@/components/comments-section"

async function getRenterData(id: string) {
  const res = await fetch(`http://localhost:4000/api/usuario/9`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Error al obtener datos del arrendatario")
  return res.json()
}
async function getComentarios(id: string) {
  const res = await fetch(`http://localhost:4000/api/comentarios/9`, {
    cache: "no-store",
  })
  if (!res.ok) return []
  return res.json()
}

export default async function RenterProfilePage({ params }: { params: { id: string } }) {
  const renter = await getRenterData(params.id)
  const comentariosCrudos = await getComentarios(params.id)

  const comentarios = comentariosCrudos.map((c: any) => ({
    id: c.id,
    anfitrion: c.calificador?.nombre || "Anónimo",
    fecha: new Date(c.fecha_creacion).toLocaleDateString(),
    contenido: c.comentario,
    calificacion: Math.round((c.comportamiento + c.cuidadovehiculo + c.puntualidad) / 3), // Promedio
    fotoAnfitrion: c.calificador?.foto || "/placeholder.svg"
  }))

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Panel izquierdo - Datos del usuario */}
        <div className="w-full md:w-1/2 space-y-6">
          <Card className="border-2 border-redibo-blue shadow-xl">
            <CardHeader className="text-center bg-redibo-blue text-redibo-white rounded-t-lg">
              <div className="mx-auto mb-4">
                <Avatar className="h-32 w-32 border-4 border-redibo-white">
                  <AvatarImage
                    src={renter.foto || "/placeholder.svg"}
                    alt={renter.nombre}
                  />
                  <AvatarFallback className="bg-redibo-orange text-redibo-black">
                    {renter.nombre}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">{renter.nombre}</CardTitle>
              <div className="flex items-center justify-center mt-2">
                <Star className="h-5 w-5 text-redibo-orange fill-redibo-orange" />
                <span className="ml-1 font-medium">{renter.calificacion ?? "4.5"}</span>
                <span className="text-sm text-redibo-bone ml-1">({renter.comentarios?.length ?? 0} reseñas)</span>
              </div>
              <CardDescription className="mt-2 flex items-center justify-center text-redibo-bone">
                <Calendar className="h-4 w-4 mr-1" />
                Miembro desde {new Date(renter.fecha_nacimiento).getFullYear()}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Briefcase className="h-5 w-5 mr-3 mt-0.5 text-redibo-blue" />
                  <div>
                    <p className="text-sm font-medium text-redibo-blue">Género</p>
                    <p className="text-sm text-redibo-black">{renter.genero}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-0.5 text-redibo-blue" />
                  <div>
                    <p className="text-sm font-medium text-redibo-blue">ID Ciudad</p>
                    <p className="text-sm text-redibo-black">{renter.nombre_ciudad}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-3 mt-0.5 text-redibo-blue" />
                  <div>
                    <p className="text-sm font-medium text-redibo-blue">Email</p>
                    <p className="text-sm text-redibo-black">{renter.correo}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 bg-redibo-bone rounded-b-lg pt-4">
              <ContactWhatsApp phone={renter.telefono} />
              <ReportRenter renterId={renter.id} />
            </CardFooter>
          </Card>

          <VerificationBadges verificaciones={renter.verificaciones || []} />

          <div className="bg-redibo-orange/20 border border-redibo-orange rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-redibo-orange mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-redibo-blue">Información confidencial</h3>
                <p className="text-xs text-redibo-black mt-1">
                  Esta información personal es confidencial y solo está disponible para anfitriones registrados.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Tabs */}
        <div className="w-full md:w-1/2 bg-redibo-bone border border-redibo-orange rounded-xl p-4 shadow-md">
          <Tabs defaultValue="comentarios" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4 bg-redibo-bone rounded-md">
              <TabsTrigger
                value="comentarios"
                className="data-[state=active]:bg-redibo-orange data-[state=active]:text-redibo-black"
              >
                Comentarios
              </TabsTrigger>

            </TabsList>
            <TabsContent value="comentarios">
              <CommentsSection comentarios={comentarios.comentario || []} nombreArrendatario={renter.nombre} />
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  )
}