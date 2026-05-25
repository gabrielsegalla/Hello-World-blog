import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { uploadCoverImage, validateImageFile } from '@/lib/upload'

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file')

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  }

  const validationError = validateImageFile(file)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  try {
    const url = await uploadCoverImage(file)
    return NextResponse.json({ url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao enviar imagem'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
