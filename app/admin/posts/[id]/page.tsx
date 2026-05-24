import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PostEditor from '@/components/PostEditor'
export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: Number(params.id) } })
  if (!post) notFound()
  return <PostEditor initial={post} />
}
