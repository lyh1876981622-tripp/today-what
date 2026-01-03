export const onRequestPost = async ({ request, env }: any) => {
  const origin = request.headers.get('Origin') || ''
  const allowedOrigin = String(env.ALLOWED_ORIGIN || '').trim()

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': allowedOrigin || origin || '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (allowedOrigin && origin && origin !== allowedOrigin) {
    return new Response(JSON.stringify({ error: 'Forbidden origin' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  const text = String(body?.text || '').trim()
  const page = String(body?.page || 'home').slice(0, 100)

  if (!text) {
    return new Response(JSON.stringify({ error: '内容不能为空' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
    })
  }
  if (text.length > 2000) {
    return new Response(JSON.stringify({ error: '内容太长（最多 2000 字）' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  const ua = request.headers.get('User-Agent') || ''
  const ip =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('x-forwarded-for') ||
    ''

  const subject = `【今天做什么｜反馈】${text.slice(0, 20)}${text.length > 20 ? '…' : ''}`

  const html = `
    <div style="font-family: ui-sans-serif, system-ui; line-height: 1.6;">
      <h2>收到新的反馈</h2>
      <p><b>问题：</b>你希望这个工具帮你解决什么？</p>
      <p><b>回答：</b></p>
      <pre style="white-space: pre-wrap; background: #f6f8fa; padding: 12px; border-radius: 8px;">${escapeHtml(
        text
      )}</pre>
      <hr/>
      <p style="color:#666;">
        page: ${escapeHtml(page)}<br/>
        ip: ${escapeHtml(String(ip))}<br/>
        ua: ${escapeHtml(ua)}<br/>
        at: ${new Date().toISOString()}
      </p>
    </div>
  `

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [env.MAIL_TO],
      subject,
      html,
    }),
  })

  const resendJson = await resendRes.json().catch(() => ({}))
  if (!resendRes.ok) {
    return new Response(JSON.stringify({ error: '发送邮件失败', detail: resendJson }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function escapeHtml(str: string) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}