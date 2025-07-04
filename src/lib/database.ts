import { supabase } from './supabase';

export interface WeddingData {
  id?: string;
  groom_name: string;
  bride_name: string;
  couple_photo?: string;
  wedding_day?: string;
  wedding_month?: string;
  wedding_year?: string;
  wedding_day_of_week?: string;
  wedding_time?: string;
  ceremony_time?: string;
  ceremony_venue?: string;
  ceremony_address?: string;
  reception_time?: string;
  reception_venue?: string;
  reception_address?: string;
  welcome_message?: string;
  invitation_title?: string;
  invitation_love_quote?: string;
  invitation_main_message?: string;
  invitation_date_message?: string;
  program_title?: string;
  ceremony_title?: string;
  reception_title?: string;
  program_welcome_message?: string;
  guestbook_title?: string;
  guestbook_subtitle?: string;
  guestbook_placeholder?: string;
  guestbook_save_button?: string;
  preferences_title?: string;
  preferences_subtitle?: string;
  preferences_description?: string;
  preferences_limitation?: string;
  preferences_alcoholic_title?: string;
  preferences_non_alcoholic_title?: string;
  cancellation_title?: string;
  cancellation_description?: string;
  cancellation_time_limit?: string;
  cancellation_cancel_button?: string;
  cancellation_modal_title?: string;
  cancellation_modal_message?: string;
  cancellation_keep_button?: string;
  cancellation_confirm_button?: string;
  cancellation_success_message?: string;
  alcoholic_drinks?: string;
  non_alcoholic_drinks?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Guest {
  id?: string;
  wedding_id: string;
  name: string;
  table_name: string;
  email?: string;
  rsvp_status?: string;
  invitation_link?: string;
  message_sender?: string;
}

export interface GuestMessage {
  id?: string;
  guest_id: string;
  message: string;
  created_at?: string;
}

export interface GuestPreference {
  id?: string;
  guest_id: string;
  alcoholic_drinks?: string;
  non_alcoholic_drinks?: string;
  created_at?: string;
}

// WeddingData CRUD
export async function getWeddingData(): Promise<WeddingData | null> {
  const { data, error } = await supabase
    .from('local_wedding_data')
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function saveWeddingData(data: WeddingData): Promise<void> {
  if (data.id) {
    const { error } = await supabase
      .from('local_wedding_data')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', data.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('local_wedding_data')
      .insert([{ ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);
    if (error) throw error;
  }
}

// Guests CRUD
export async function getGuests(weddingId: string): Promise<Guest[]> {
  const { data, error } = await supabase
    .from('local_guests')
    .select('*')
    .eq('wedding_id', weddingId);
  if (error) throw error;
  return data || [];
}

export async function addGuest(guest: Guest): Promise<void> {
  const { error } = await supabase
    .from('local_guests')
    .insert([{ ...guest }]);
  if (error) throw error;
}

export async function updateGuest(guest: Guest): Promise<void> {
  if (!guest.id) throw new Error('Missing guest id');
  const { error } = await supabase
    .from('local_guests')
    .update({ ...guest })
    .eq('id', guest.id);
  if (error) throw error;
}

export async function deleteGuest(id: string): Promise<void> {
  const { error } = await supabase
    .from('local_guests')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Guest Messages
export async function addGuestMessage(guestId: string, message: string): Promise<void> {
  const { error } = await supabase
    .from('local_guest_messages')
    .insert([{ guest_id: guestId, message }]);
  if (error) throw error;
}

export async function getGuestMessages(guestId: string): Promise<GuestMessage[]> {
  const { data, error } = await supabase
    .from('local_guest_messages')
    .select('*')
    .eq('guest_id', guestId);
  if (error) throw error;
  return data || [];
}

// Guest Preferences
export async function saveGuestPreferences(guestId: string, alcoholicDrinks: string, nonAlcoholicDrinks: string): Promise<void> {
  // Upsert (delete then insert)
  await supabase.from('local_guest_preferences').delete().eq('guest_id', guestId);
  const { error } = await supabase
    .from('local_guest_preferences')
    .insert([{ guest_id: guestId, alcoholic_drinks: alcoholicDrinks, non_alcoholic_drinks: nonAlcoholicDrinks }]);
  if (error) throw error;
}

export async function getGuestPreferences(guestId: string): Promise<GuestPreference | null> {
  const { data, error } = await supabase
    .from('local_guest_preferences')
    .select('*')
    .eq('guest_id', guestId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
} 