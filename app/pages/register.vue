<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const toast = useToast()
const headers = useRequestHeaders(['cookie'])

// State
const loading = ref(false)
const step = ref<'register' | 'verify'>('register')
const registeredEmail = ref('')

// Register field
const registerFields: AuthFormField[] = [{
  name: 'full_name',
  type: 'text',
  label: 'Nama Lengkap',
  placeholder: 'Masukkan nama lengkap',
  autofocus: true,
  required: true
}, {
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password',
  placeholder: 'Enter your password',
  required: true
}]

// Verify field
const verifyFields: AuthFormField[] = [{
  name: 'otp',
  type: 'otp',
  label: 'Kode OTP',
  length: 6,
  placeholder: '○',
  autofocus: true,
  required: true
}]

// const providers = [{
//   label: 'Google',
//   icon: 'i-simple-icons-google',
//   onClick: async () => {
//     // toast.add({ title: 'Google', description: 'Login dengan Google' })
//     const { error } = await client.auth.signInWithOAuth({
//       provider: 'google',
//       options: {
//         redirectTo: `${window.location.origin}/confirm`
//       }
//     })
//     if (error) toast.add({ title: 'Error', description: error.message, color: 'error' })
//   }
// }]

// Skema registrasi
const registerSchema = z.object({
  full_name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Minimal 6 karakter')
})

// Skema verifikasi
const verifySchema = z.object({
  otp: z
    .array(
      z.string().regex(/^\d$/, 'Harus angka')
    )
    .length(6, 'Kode harus terdiri dari 6 angka')
})

// Handle register
async function onRegister(payload: FormSubmitEvent<z.output<typeof registerSchema>>) {
  loading.value = true
  try {
    const { register } = await $fetch('/api/auth/register', {
      headers,
      method: 'POST',
      body: {
        full_name: payload.data.full_name,
        email: payload.data.email,
        password: payload.data.password
      }
    })

    // Jika sukses, jangan redirect, tapi pindah ke step verify
    if (register.user && !register.session) {
      registeredEmail.value = payload.data.email
      step.value = 'verify'
      toast.add({ title: 'Kode Terkirim', description: 'Cek email Anda untuk kode verifikasi.', color: 'info' })
    } else if (register.session) {
      // Edge case: Jika confirm email dimatikan di supabase, user langsung login
      navigateTo('/')
    }
  } catch (err) {
    // toast.add({ title: 'Gagal Daftar', description: err.message, color: 'error' })
    // console.error('Error registrasi:', err)
    const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui'
    toast.add({ title: 'Gagal Daftar', description: errorMessage, color: 'error' })
  } finally {
    loading.value = false
  }
}

// Handle verifikasi
async function onVerify(payload: FormSubmitEvent<z.output<typeof verifySchema>>) {
  loading.value = true
  try {
    const otpString = payload.data.otp.join('')
    await $fetch('/api/auth/verify', {
      headers,
      method: 'POST',
      body: {
        email: registeredEmail.value,
        token: otpString
      }
    })

    // JIKA MENGGUNAKAN TRIGGER DATABASE (Seperti jawaban sebelumnya):
    // Profil sudah otomatis dibuat saat signUp, jadi kita tidak perlu insert manual lagi.

    // JIKA TIDAK PAKAI TRIGGER, insert manual ke profiles di sini:
    /*
    await client.from('profiles').insert({
       id: data.user.id,
       email: registeredEmail.value,
       // ... data lain
    })
    */

    toast.add({ title: 'Registrasi akun berhasil', color: 'success' })

    // Redirect ke setup-profile (sesuai logic "Mutlak" sebelumnya)
    // router.push('/setup-profile')
    navigateTo('/')
  } catch (err) {
    // console.error('Error verifikasi:', err)
    const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui'
    toast.add({ title: 'Verifikasi Gagal', description: errorMessage, color: 'error' })
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
    <!-- Register Wrapper -->
    <UPageCard
      variant="soft"
      class="w-full max-w-md px-10 py-5 shadow-md"
    >
      <UAuthForm
        v-if="step === 'register'"
        title="Daftar Sekarang"
        description="Buat akun baru"
        :schema="registerSchema"
        :fields="registerFields"
        :loading="loading"
        :disabled="loading"
        :ui="{ title: 'text-left', description: 'text-left mb-10' }"
        :submit="{ label: 'Daftar Akun' }"
        @submit="onRegister"
      >
        <template #footer>
          <div class="mb-10">
            Sudah punya akun?
            <ULink
              to="/login"
              class="text-primary dark:text-white font-semibold underline"
            >ke halaman login</ULink>
          </div>
          <div class="text-xs">
            By signing in, you agree to our <ULink
              to="#"
              class="text-primary font-medium"
            >Terms of Service</ULink>.
          </div>
        </template>
      </UAuthForm>
      <UAuthForm
        v-else
        title="Verifikasi Email"
        description="Gunakan Kode OTP yang dikirimkan ke email Anda."
        :schema="verifySchema"
        :fields="verifyFields"
        :loading="loading"
        :disabled="loading"
        :submit="{ label: 'Submit' }"
        @submit="onVerify"
      >
        <template #footer>
          <UButton
            variant="ghost"
            size="xs"
            :disabled="loading"
            @click="step = 'register'"
          >
            Ganti email
          </UButton>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
