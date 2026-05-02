<!-- app/pages/login.vue -->
<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const client = useSupabaseClient()
const toast = useToast()
const redirectInfo = useSupabaseCookieRedirect()
const headers = useRequestHeaders(['cookie'])

// State loading
const loading = ref(false)

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Enter your email',
  autofocus: true,
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password',
  placeholder: 'Enter your password',
  required: true
}]

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string('Password is required').min(6, 'Minimal 6 karakter')
})

async function onSubmit(payload: FormSubmitEvent<z.output<typeof schema>>) {
  // console.log('Submitted', payload)
  const path = redirectInfo.pluck()
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      headers,
      method: 'POST',
      body: {
        email: payload.data.email,
        password: payload.data.password
      }
    })

    // router.push('/consultant')
    toast.add({ title: 'Success', description: 'Selamat datang kembali!', color: 'success' })

    await client.auth.refreshSession()

    // Redirect to the saved path, or fallback to home
    await navigateTo(path || '/')

    // Cek apakah ada redirect URL (dari tombol chat sebelumnya)
    // const redirectTo = route.query.redirectTo as string || '/'
    // router.push(redirectTo)
    // }
  } catch (err) {
    // console.error('Error login:', err)
    const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui'
    toast.add({ title: 'Login Gagal', description: errorMessage, color: 'error' })
  } finally {
    loading.value = false
  }
}

definePageMeta({
  layout: 'guess'
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900 p-4">
    <!-- Login Wrapper -->
    <UPageCard
      variant="soft"
      class="w-full max-w-md px-10 py-5 shadow-md"
    >
      <UAuthForm
        title="Welcome Back"
        description="Gunakan akun Anda untuk login"
        :schema="schema"
        :fields="fields"
        :loading="loading"
        :disabled="loading"
        :ui="{ title: 'text-left', description: 'text-left mb-10' }"
        :submit="{ label: 'Login' }"
        @submit="onSubmit"
      >
        <template #password-hint>
          <ULink
            to="/password/reset"
            class="text-primary font-medium"
            tabindex="-1"
          >Lupa password?</ULink>
        </template>
        <template #footer>
          <div class="mb-10">
            Belum punya akun?
            <ULink
              to="/register"
              class="text-primary dark:text-white font-semibold underline"
            >daftar sekarang</ULink>
          </div>
          <div class="text-xs">
            By signing in, you agree to our <ULink
              to="#"
              class="text-primary font-medium"
            >Terms of Service</ULink>.
          </div>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
