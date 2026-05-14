import { db }       from '@/lib/db'
import { notFound }  from 'next/navigation'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const invitation = await db.invitation.findUnique({
    where:  { slug },
    select: { id: true, html: true, status: true },
  })

  if (!invitation || invitation.status !== 'PUBLISHED') notFound()

  // increment view count (fire-and-forget)
  db.invitation.update({ where: { slug }, data: { viewCount: { increment: 1 } } })
    .catch(() => {})

  // Inject RSVP bridge so the AI-generated form posts to our API
  const rsvpScript = `<script>
window.__rsvpSubmit=async function(d){
  try{
    var r=await fetch('/api/invitations/${invitation.id}/rsvp',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        name:String(d.name||'').trim(),
        phone:d.phone?String(d.phone).trim():undefined,
        guestCount:Math.max(1,Math.min(10,parseInt(d.guestCount)||1)),
        attending:d.attending===true||d.attending==='true',
        message:d.message?String(d.message).trim():undefined
      })
    });
    return r.ok;
  }catch(e){return false;}
};
</script>`

  const htmlToServe = invitation.html.replace('</head>', rsvpScript + '\n</head>')

  return new Response(htmlToServe, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
