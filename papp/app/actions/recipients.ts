'use server'

import { api } from '@/lib/api'
import { apiServer } from '@/lib/api-server'
import { revalidatePath } from 'next/cache'

export async function getRecipients() {
  try {
    const recipients = await apiServer.recipients.list()
    return { success: true, data: recipients }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getRecipient(id: string) {
  try {
    const recipient = await apiServer.recipients.get(id)
    return { success: true, data: recipient }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getBanks() {
  try {
    const banks = await apiServer.recipients.getBanks()
    return { success: true, data: banks }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function validateBankAccount(accountNumber: string, bankCode: string) {
  try {
    const result = await api.recipients.validateAccount(accountNumber, bankCode)
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function createRecipient(formData: FormData) {
  try {
    const recipient = await api.recipients.create({
      name: formData.get('name') as string,
      accountNumber: formData.get('accountNumber') as string,
      bankCode: formData.get('bankCode') as string,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    })
    
    revalidatePath('/dashboard/recipients')
    return { success: true, data: recipient }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function updateRecipient(id: string, formData: FormData) {
  try {
    const recipient = await api.recipients.update(id, {
      name: formData.get('name') as string || undefined,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    })
    
    revalidatePath('/dashboard/recipients')
    return { success: true, data: recipient }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function deleteRecipient(id: string) {
  try {
    await api.recipients.delete(id)
    revalidatePath('/dashboard/recipients')
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
