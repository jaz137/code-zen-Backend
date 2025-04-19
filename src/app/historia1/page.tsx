import Header from "@/components/ui/Header";
import RenterProfilePage from "@/components/ui/historia1/RenterProfilePage";

export default function Historia1Page({ params }: { params: { id: string } }) {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-8 md:px-8 lg:px-16">
        <RenterProfilePage params={params} />
      </main>
    </>
  );
}


