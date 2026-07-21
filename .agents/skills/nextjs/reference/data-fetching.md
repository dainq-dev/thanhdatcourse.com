# Data Fetching, Mutating, Caching & Revalidating

## Fetching data in Server Components

Server Components are async by default — fetch directly:
```tsx
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  const items = await data.json()
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
}
```

### Using `searchParams` prop
```tsx
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const filters = (await searchParams).filters
  // fetch data using filters
}
```
Using `searchParams` opts into **dynamic rendering**.

### `params` prop
```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
}
```

### Static generation with `generateStaticParams`
```tsx
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())
  return posts.map(post => ({ slug: post.slug }))
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // ...
}
```

## Mutating data (Server Actions / Server Functions)

### Defining with `"use server"`
```tsx
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title')
  await db.post.create({ data: { title } })
  revalidatePath('/posts')
}
```

### Using in forms
```tsx
import { createPost } from '@/app/actions'

export default function NewPostForm() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  )
}
```

### Using `<Form>` component (v16+)
```tsx
import Form from 'next/form'

export default function SearchForm() {
  return (
    <Form action="/search">
      <input name="query" />
      <button type="submit">Search</button>
    </Form>
  )
}
```
`<Form>` handles form submissions and search param updates with client-side navigation.

### Invoking programmatically
```tsx
'use client'
import { createPost } from '@/app/actions'

export function CreateButton() {
  return (
    <button onClick={() => createPost(formData)}>Create</button>
  )
}
```

### Server-only code
Use `import 'server-only'` to prevent server code from leaking to client.

## Caching (v16.2 Cache Components model)

### `use cache` directive
Caches a function or component result:
```tsx
export async function getPost(slug: string) {
  "use cache"
  const post = await db.post.findUnique({ where: { slug } })
  return post
}
```

### `use cache: private`
For functions accessing request-scoped APIs:
```tsx
export async function getUserPreferences() {
  "use cache: private"
  const cookieStore = await cookies()
  // ...
}
```

### `use cache: remote`
For persistent, shared caching across instances:
```tsx
export async function getGlobalData() {
  "use cache: remote"
  return await fetch('https://...')
}
```

### Cache tags and lifecycle
```tsx
import { cacheTag } from 'next/cache'
import { cacheLife } from 'next/cache'

export async function getPosts() {
  "use cache"
  cacheTag('posts')
  cacheLife('hours')  // uses profile from next.config.js
  return await db.post.findMany()
}
```

### Revalidating
```tsx
import { revalidatePath } from 'next/cache'
import { revalidateTag } from 'next/cache'

// In a Server Action:
revalidatePath('/posts')      // revalidate all data for /posts
revalidateTag('posts')        // revalidate everything tagged 'posts'
```

### Client-side refresh
```tsx
import { refresh } from 'next/cache'

// Refresh current route from server
refresh()
```

### `staleTimes` config
In `next.config.js`:
```js
module.exports = {
  staleTimes: {
    dynamic: 0,   // seconds before client cache is stale for dynamic
    static: 300,  // seconds for static (prerendered) routes
  }
}
```

### `useLinkStatus` hook
```tsx
'use client'
import { useLinkStatus } from 'next/link'

export function LinkIndicator({ href }: { href: string }) {
  const { pending } = useLinkStatus(href)
  return pending ? <span>Loading...</span> : null
}
```

### Streaming & Suspense
```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<Skeleton />}>
        <DataComponent />
      </Suspense>
    </div>
  )
}
```
