import { useState, useEffect, useCallback } from 'react';
import { databaseService, WeddingData } from '../lib/database';
import { WeddingDetails, GuestInfo, DrinkOptions, WeddingTexts } from '../data/weddingData';

export const useDatabase = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDb = async () => {
      try {
        await databaseService.initialize();
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
        setIsLoading(false);
      }
    };

    initializeDb();
  }, []);

  const loadWeddingData = useCallback(async () => {
    try {
      const data = await databaseService.getWeddingData();
      if (!data) return null;

      return convertDbToAppData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wedding data');
      return null;
    }
  }, []);

  const saveWeddingData = useCallback(async (
    weddingDetails: WeddingDetails,
    guestInfo: GuestInfo,
    drinkOptions: DrinkOptions,
    weddingTexts: WeddingTexts
  ) => {
    try {
      const dbData = convertAppToDbData(weddingDetails, guestInfo, drinkOptions, weddingTexts);
      await databaseService.saveWeddingData(dbData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save wedding data');
      throw err;
    }
  }, []);

  const saveGuestMessage = useCallback(async (guestName: string, message: string) => {
    try {
      await databaseService.saveGuestMessage(guestName, message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save guest message');
      throw err;
    }
  }, []);

  const saveGuestPreferences = useCallback(async (guestName: string, alcoholicDrinks: string[], nonAlcoholicDrinks: string[]) => {
    try {
      await databaseService.saveGuestPreferences(guestName, alcoholicDrinks, nonAlcoholicDrinks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save guest preferences');
      throw err;
    }
  }, []);

  const exportDatabase = useCallback(async () => {
    try {
      const data = await databaseService.exportDatabase();
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wedding-database-${new Date().toISOString().split('T')[0]}.db`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export database');
      throw err;
    }
  }, []);

  const importDatabase = useCallback(async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      await databaseService.importDatabase(uint8Array);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import database');
      throw err;
    }
  }, []);

  const getGuestMessages = useCallback(async () => {
    try {
      return await databaseService.getGuestMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get guest messages');
      return [];
    }
  }, []);

  const getGuestPreferences = useCallback(async () => {
    try {
      return await databaseService.getGuestPreferences();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get guest preferences');
      return [];
    }
  }, []);

  const getGuests = useCallback(async () => {
    try {
      return await databaseService.getGuests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get guests');
      return [];
    }
  }, []);

  const addGuest = useCallback(async (
    id: string,
    name: string,
    table_name: string,
    email: string = '',
    rsvpStatus: string = '',
    invitationLink: string = '',
    messageSender: string = ''
  ) => {
    try {
      await databaseService.addGuest(id, name, table_name, email, rsvpStatus, invitationLink, messageSender);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add guest');
      throw err;
    }
  }, []);

  const updateGuestStatus = useCallback(async (id: string, newStatus: string) => {
    try {
      await databaseService.updateGuestStatus(id, newStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update guest status');
      throw err;
    }
  }, []);

  const deleteGuest = useCallback(async (id: string) => {
    try {
      await databaseService.deleteGuest(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete guest');
      throw err;
    }
  }, []);

  const updateGuest = useCallback(async (id: string, name: string, table_name: string, email: string = '') => {
    try {
      await databaseService.updateGuest(id, name, table_name, email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update guest');
      throw err;
    }
  }, []);

  return {
    isLoading,
    error,
    loadWeddingData,
    saveWeddingData,
    saveGuestMessage,
    saveGuestPreferences,
    exportDatabase,
    importDatabase,
    getGuestMessages,
    getGuestPreferences,
    getGuests,
    addGuest,
    updateGuestStatus,
    deleteGuest,
    updateGuest
  };
};

// Helper functions to convert between app data structure and database structure
const convertDbToAppData = (data: WeddingData) => {
  const weddingDetails: WeddingDetails = {
    groomName: data.groomName,
    brideName: data.brideName,
    couplePhoto: data.couplePhoto,
    weddingDate: {
      day: data.weddingDay,
      month: data.weddingMonth,
      year: data.weddingYear,
      dayOfWeek: data.weddingDayOfWeek,
      time: data.weddingTime
    },
    ceremony: {
      time: data.ceremonyTime,
      venue: data.ceremonyVenue,
      address: data.ceremonyAddress
    },
    reception: {
      time: data.receptionTime,
      venue: data.receptionVenue,
      address: data.receptionAddress
    }
  };

  const guestInfo: GuestInfo = {
    name: data.guestName,
    table: data.guestTable
  };

  const drinkOptions: DrinkOptions = {
    alcoholic: JSON.parse(data.alcoholicDrinks),
    nonAlcoholic: JSON.parse(data.nonAlcoholicDrinks)
  };

  const weddingTexts: WeddingTexts = {
    welcome: {
      invitationMessage: data.welcomeMessage
    },
    invitation: {
      title: data.invitationTitle,
      personalTitle: "Votre Invitation Personnalisée",
      guestLabel: "Invité(e) :",
      tableLabel: "Table :",
      loveQuote: data.invitationLoveQuote,
      mainMessage: data.invitationMainMessage,
      dateMessage: data.invitationDateMessage
    },
    program: {
      title: data.programTitle,
      ceremonyTitle: data.ceremonyTitle,
      receptionTitle: data.receptionTitle,
      welcomeMessage: data.programWelcomeMessage
    },
    guestbook: {
      title: data.guestbookTitle,
      subtitle: data.guestbookSubtitle,
      placeholder: data.guestbookPlaceholder,
      saveButton: data.guestbookSaveButton
    },
    preferences: {
      title: data.preferencesTitle,
      subtitle: data.preferencesSubtitle,
      description: data.preferencesDescription,
      limitation: data.preferencesLimitation,
      alcoholicTitle: data.preferencesAlcoholicTitle,
      nonAlcoholicTitle: data.preferencesNonAlcoholicTitle
    },
    cancellation: {
      title: data.cancellationTitle,
      description: data.cancellationDescription,
      timeLimit: data.cancellationTimeLimit,
      cancelButton: data.cancellationCancelButton,
      modalTitle: data.cancellationModalTitle,
      modalMessage: data.cancellationModalMessage,
      keepButton: data.cancellationKeepButton,
      confirmButton: data.cancellationConfirmButton,
      successMessage: data.cancellationSuccessMessage
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
    groomName: weddingDetails.groomName,
    brideName: weddingDetails.brideName,
    couplePhoto: weddingDetails.couplePhoto,
    weddingDay: weddingDetails.weddingDate.day,
    weddingMonth: weddingDetails.weddingDate.month,
    weddingYear: weddingDetails.weddingDate.year,
    weddingDayOfWeek: weddingDetails.weddingDate.dayOfWeek,
    weddingTime: weddingDetails.weddingDate.time,
    ceremonyTime: weddingDetails.ceremony.time,
    ceremonyVenue: weddingDetails.ceremony.venue,
    ceremonyAddress: weddingDetails.ceremony.address,
    receptionTime: weddingDetails.reception.time,
    receptionVenue: weddingDetails.reception.venue,
    receptionAddress: weddingDetails.reception.address,
    guestName: guestInfo.name,
    guestTable: guestInfo.table,
    alcoholicDrinks: JSON.stringify(drinkOptions.alcoholic),
    nonAlcoholicDrinks: JSON.stringify(drinkOptions.nonAlcoholic),
    welcomeMessage: weddingTexts.welcome.invitationMessage,
    invitationTitle: weddingTexts.invitation.title,
    invitationLoveQuote: weddingTexts.invitation.loveQuote,
    invitationMainMessage: weddingTexts.invitation.mainMessage,
    invitationDateMessage: weddingTexts.invitation.dateMessage,
    programTitle: weddingTexts.program.title,
    ceremonyTitle: weddingTexts.program.ceremonyTitle,
    receptionTitle: weddingTexts.program.receptionTitle,
    programWelcomeMessage: weddingTexts.program.welcomeMessage,
    guestbookTitle: weddingTexts.guestbook.title,
    guestbookSubtitle: weddingTexts.guestbook.subtitle,
    guestbookPlaceholder: weddingTexts.guestbook.placeholder,
    guestbookSaveButton: weddingTexts.guestbook.saveButton,
    preferencesTitle: weddingTexts.preferences.title,
    preferencesSubtitle: weddingTexts.preferences.subtitle,
    preferencesDescription: weddingTexts.preferences.description,
    preferencesLimitation: weddingTexts.preferences.limitation,
    preferencesAlcoholicTitle: weddingTexts.preferences.alcoholicTitle,
    preferencesNonAlcoholicTitle: weddingTexts.preferences.nonAlcoholicTitle,
    cancellationTitle: weddingTexts.cancellation.title,
    cancellationDescription: weddingTexts.cancellation.description,
    cancellationTimeLimit: weddingTexts.cancellation.timeLimit,
    cancellationCancelButton: weddingTexts.cancellation.cancelButton,
    cancellationModalTitle: weddingTexts.cancellation.modalTitle,
    cancellationModalMessage: weddingTexts.cancellation.modalMessage,
    cancellationKeepButton: weddingTexts.cancellation.keepButton,
    cancellationConfirmButton: weddingTexts.cancellation.confirmButton,
    cancellationSuccessMessage: weddingTexts.cancellation.successMessage
  };
}; 