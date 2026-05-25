import Navbar from '@/components/Navbar'

export default function PostLoading() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '100px 5% 60px', position: 'relative', zIndex: 1 }}>
        <div className="skeleton" style={{ width: 80, height: 14, marginBottom: 36 }} />
        <div className="skeleton" style={{ width: 120, height: 12, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: '90%', height: 36, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: '70%', height: 36, marginBottom: 28 }} />
        <div className="skeleton" style={{ width: '100%', height: 1, marginBottom: 40 }} />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton" style={{ width: '100%', height: 16, marginBottom: 14 }} />
        ))}
      </main>
    </>
  )
}
