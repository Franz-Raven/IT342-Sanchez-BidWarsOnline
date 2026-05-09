import Navigation from "@/shared/components/navigation"

export default function NavbarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navigation />
      {children}
    </>
  )
}

