import { useState, useEffect, useCallback } from 'react';
import {
  getWeddingData,
  saveWeddingData,
  getGuests,
  addGuest,
  updateGuest,
  deleteGuest,
  addGuestMessage,
  getGuestMessages,
  saveGuestPreferences as saveGuestPreferencesDb,
  getGuestPreferences,
  uploadCouplePhoto,
  deleteCouplePhoto,
} from '../lib/database';
import { WeddingDetails, GuestInfo, DrinkOptions, WeddingTexts } from '../data/weddingData';
import type { WeddingData } from '../lib/database';

export const useDatabase = () => {
  const [error, setError] = useState<string | null>(null);

  const loadWeddingData = async () => {
    try {
      const data = await getWeddingData();
      if (!data) return null;
      return convertDbToAppData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wedding data');
      return null;
    }
  };

  const saveWedding = async (data: any) => {
    try {
      await saveWeddingData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save wedding data');
      throw err;
    }
  };

  const fetchGuests = async (weddingId: string) => {
    try {
      return await getGuests(weddingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get guests');
      return [];
    }
  };

  const addNewGuest = async (guest: any) => {
    try {
      await addGuest(guest);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add guest');
      throw err;
    }
  };

  const updateExistingGuest = async (guest: any) => {
    try {
      await updateGuest(guest);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update guest');
      throw err;
    }
  };

  const removeGuest = async (id: string) => {
    try {
      await deleteGuest(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete guest');
      throw err;
    }
  };

  const saveGuestMessage = useCallback(async (guestId: string, message: string) => {
    try {
      await addGuestMessage(guestId, message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save guest message');
      throw err;
    }
  }, []);

  const saveGuestPreferences = useCallback(async (guestId: string, alcoholicDrinks: string[], nonAlcoholicDrinks: string[]) => {
    try {
      await saveGuestPreferencesDb(guestId, JSON.stringify(alcoholicDrinks), JSON.stringify(nonAlcoholicDrinks));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save guest preferences');
      throw err;
    }
  }, []);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    try {
      return await uploadCouplePhoto(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      throw err;
    }
  }, []);

  const deleteImage = useCallback(async (imageUrl: string): Promise<void> => {
    try {
      await deleteCouplePhoto(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
      throw err;
    }
  }, []);

  return {
    error,
    loadWeddingData,
    saveWedding,
    fetchGuests,
    addNewGuest,
    updateExistingGuest,
    removeGuest,
    saveGuestMessage,
    saveGuestPreferences,
    getGuestMessages,
    getGuestPreferences,
    uploadImage,
    deleteImage,
  };
};

// Helper functions to convert between app data structure and database structure
const convertDbToAppData = (data: WeddingData) => {
  const weddingDetails: WeddingDetails = {
    id: data.id ?? '',
    groomName: data.groom_name ?? '',
    brideName: data.bride_name ?? '',
    couplePhoto: data.couple_photo ?? '',
    weddingDate: {
      day: data.wedding_day ?? '',
      month: data.wedding_month ?? '',
      year: data.wedding_year ?? '',
      dayOfWeek: data.wedding_day_of_week ?? '',
      time: data.wedding_time ?? ''
    },
    ceremony: {
      time: data.ceremony_time ?? '',
      venue: data.ceremony_venue ?? '',
      address: data.ceremony_address ?? ''
    },
    reception: {
      time: data.reception_time ?? '',
      venue: data.reception_venue ?? '',
      address: data.reception_address ?? ''
    }
  };

  const guestInfo: GuestInfo = {
    name: (data as any).guest_name ?? '',
    table: (data as any).guest_table ?? ''
  };

  const drinkOptions: DrinkOptions = {
    alcoholic: data.alcoholic_drinks ? JSON.parse(data.alcoholic_drinks) : [],
    nonAlcoholic: data.non_alcoholic_drinks ? JSON.parse(data.non_alcoholic_drinks) : []
  };

  const weddingTexts: WeddingTexts = {
    welcome: {
      invitationMessage: data.welcome_message ?? ''
    },
    invitation: {
      title: data.invitation_title ?? '',
      personalTitle: "Votre Invitation Personnalisée",
      guestLabel: "Invité(e) :",
      tableLabel: "Table :",
      loveQuote: data.invitation_love_quote ?? '',
      mainMessage: data.invitation_main_message ?? '',
      dateMessage: data.invitation_date_message ?? ''
    },
    program: {
      title: data.program_title ?? '',
      ceremonyTitle: data.ceremony_title ?? '',
      receptionTitle: data.reception_title ?? '',
      welcomeMessage: data.program_welcome_message ?? ''
    },
    guestbook: {
      title: data.guestbook_title ?? '',
      subtitle: data.guestbook_subtitle ?? '',
      placeholder: data.guestbook_placeholder ?? '',
      saveButton: data.guestbook_save_button ?? ''
    },
    preferences: {
      title: data.preferences_title ?? '',
      subtitle: data.preferences_subtitle ?? '',
      description: data.preferences_description ?? '',
      limitation: data.preferences_limitation ?? '',
      alcoholicTitle: data.preferences_alcoholic_title ?? '',
      nonAlcoholicTitle: data.preferences_non_alcoholic_title ?? ''
    },
    cancellation: {
      title: data.cancellation_title ?? '',
      description: data.cancellation_description ?? '',
      timeLimit: data.cancellation_time_limit ?? '',
      cancelButton: data.cancellation_cancel_button ?? '',
      modalTitle: data.cancellation_modal_title ?? '',
      modalMessage: data.cancellation_modal_message ?? '',
      keepButton: data.cancellation_keep_button ?? '',
      confirmButton: data.cancellation_confirm_button ?? '',
      successMessage: data.cancellation_success_message ?? ''
    }
  };

  return { weddingDetails, guestInfo, drinkOptions, weddingTexts };
};

const convertAppToDbData = (
  weddingDetails: WeddingDetails,
  guestInfo: GuestInfo,
  drinkOptions: DrinkOptions,
  weddingTexts: WeddingTexts
): Omit<WeddingData, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    groom_name: weddingDetails.groomName,
    bride_name: weddingDetails.brideName,
    couple_photo: weddingDetails.couplePhoto,
    wedding_day: weddingDetails.weddingDate.day,
    wedding_month: weddingDetails.weddingDate.month,
    wedding_year: weddingDetails.weddingDate.year,
    wedding_day_of_week: weddingDetails.weddingDate.dayOfWeek,
    wedding_time: weddingDetails.weddingDate.time,
    ceremony_time: weddingDetails.ceremony.time,
    ceremony_venue: weddingDetails.ceremony.venue,
    ceremony_address: weddingDetails.ceremony.address,
    reception_time: weddingDetails.reception.time,
    reception_venue: weddingDetails.reception.venue,
    reception_address: weddingDetails.reception.address,
    alcoholic_drinks: JSON.stringify(drinkOptions.alcoholic),
    non_alcoholic_drinks: JSON.stringify(drinkOptions.nonAlcoholic),
    welcome_message: weddingTexts.welcome.invitationMessage,
    invitation_title: weddingTexts.invitation.title,
    invitation_love_quote: weddingTexts.invitation.loveQuote,
    invitation_main_message: weddingTexts.invitation.mainMessage,
    invitation_date_message: weddingTexts.invitation.dateMessage,
    program_title: weddingTexts.program.title,
    ceremony_title: weddingTexts.program.ceremonyTitle,
    reception_title: weddingTexts.program.receptionTitle,
    program_welcome_message: weddingTexts.program.welcomeMessage,
    guestbook_title: weddingTexts.guestbook.title,
    guestbook_subtitle: weddingTexts.guestbook.subtitle,
    guestbook_placeholder: weddingTexts.guestbook.placeholder,
    guestbook_save_button: weddingTexts.guestbook.saveButton,
    preferences_title: weddingTexts.preferences.title,
    preferences_subtitle: weddingTexts.preferences.subtitle,
    preferences_description: weddingTexts.preferences.description,
    preferences_limitation: weddingTexts.preferences.limitation,
    preferences_alcoholic_title: weddingTexts.preferences.alcoholicTitle,
    preferences_non_alcoholic_title: weddingTexts.preferences.nonAlcoholicTitle,
    cancellation_title: weddingTexts.cancellation.title,
    cancellation_description: weddingTexts.cancellation.description,
    cancellation_time_limit: weddingTexts.cancellation.timeLimit,
    cancellation_cancel_button: weddingTexts.cancellation.cancelButton,
    cancellation_modal_title: weddingTexts.cancellation.modalTitle,
    cancellation_modal_message: weddingTexts.cancellation.modalMessage,
    cancellation_keep_button: weddingTexts.cancellation.keepButton,
    cancellation_confirm_button: weddingTexts.cancellation.confirmButton,
    cancellation_success_message: weddingTexts.cancellation.successMessage
  };
}; 