import initSqlJs, { Database } from 'sql.js';

export interface WeddingData {
  id?: number;
  groomName: string;
  brideName: string;
  couplePhoto: string;
  weddingDay: string;
  weddingMonth: string;
  weddingYear: string;
  weddingDayOfWeek: string;
  weddingTime: string;
  ceremonyTime: string;
  ceremonyVenue: string;
  ceremonyAddress: string;
  receptionTime: string;
  receptionVenue: string;
  receptionAddress: string;
  guestName: string;
  guestTable: string;
  alcoholicDrinks: string;
  nonAlcoholicDrinks: string;
  welcomeMessage: string;
  invitationTitle: string;
  invitationLoveQuote: string;
  invitationMainMessage: string;
  invitationDateMessage: string;
  programTitle: string;
  ceremonyTitle: string;
  receptionTitle: string;
  programWelcomeMessage: string;
  guestbookTitle: string;
  guestbookSubtitle: string;
  guestbookPlaceholder: string;
  guestbookSaveButton: string;
  preferencesTitle: string;
  preferencesSubtitle: string;
  preferencesDescription: string;
  preferencesLimitation: string;
  preferencesAlcoholicTitle: string;
  preferencesNonAlcoholicTitle: string;
  cancellationTitle: string;
  cancellationDescription: string;
  cancellationTimeLimit: string;
  cancellationCancelButton: string;
  cancellationModalTitle: string;
  cancellationModalMessage: string;
  cancellationKeepButton: string;
  cancellationConfirmButton: string;
  cancellationSuccessMessage: string;
  createdAt: string;
  updatedAt: string;
}
export type WeddingDataInput=Omit<WeddingData, 'id' | 'createdAt' | 'updatedAt'>&{
  alcoholicDrinks: string[];
  nonAlcoholicDrinks: string[];
}

class DatabaseService {
  private db: Database | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('Database already initialized');
      return;
    }

    try {
      console.log('Initializing SQL.js...');
      const SQL = await initSqlJs({
        locateFile: (file) => {
          console.log('Loading WASM file:', file);
          return `/wasm/${file}`;
        }
      });

      // Try to load existing database from localStorage
      const savedDb = localStorage.getItem('wedding_database');
      console.log('Existing database in localStorage:', savedDb ? 'Yes' : 'No');
      
      if (savedDb) {
        const uint8Array = new Uint8Array(JSON.parse(savedDb));
        this.db = new SQL.Database(uint8Array);
        console.log('Database loaded from localStorage');
      } else {
        console.log('Creating new database...');
        this.db = new SQL.Database();
        await this.createTables();
        await this.insertDefaultData();
        console.log('New database created with tables and default data');
      }

      this.initialized = true;
      console.log('Database initialization complete');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS wedding_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        groomName TEXT NOT NULL,
        brideName TEXT NOT NULL,
        couplePhoto TEXT NOT NULL,
        weddingDay TEXT NOT NULL,
        weddingMonth TEXT NOT NULL,
        weddingYear TEXT NOT NULL,
        weddingDayOfWeek TEXT NOT NULL,
        weddingTime TEXT NOT NULL,
        ceremonyTime TEXT NOT NULL,
        ceremonyVenue TEXT NOT NULL,
        ceremonyAddress TEXT NOT NULL,
        receptionTime TEXT NOT NULL,
        receptionVenue TEXT NOT NULL,
        receptionAddress TEXT NOT NULL,
        guestName TEXT NOT NULL,
        guestTable TEXT NOT NULL,
        alcoholicDrinks TEXT NOT NULL,
        nonAlcoholicDrinks TEXT NOT NULL,
        welcomeMessage TEXT NOT NULL,
        invitationTitle TEXT NOT NULL,
        invitationLoveQuote TEXT NOT NULL,
        invitationMainMessage TEXT NOT NULL,
        invitationDateMessage TEXT NOT NULL,
        programTitle TEXT NOT NULL,
        ceremonyTitle TEXT NOT NULL,
        receptionTitle TEXT NOT NULL,
        programWelcomeMessage TEXT NOT NULL,
        guestbookTitle TEXT NOT NULL,
        guestbookSubtitle TEXT NOT NULL,
        guestbookPlaceholder TEXT NOT NULL,
        guestbookSaveButton TEXT NOT NULL,
        preferencesTitle TEXT NOT NULL,
        preferencesSubtitle TEXT NOT NULL,
        preferencesDescription TEXT NOT NULL,
        preferencesLimitation TEXT NOT NULL,
        preferencesAlcoholicTitle TEXT NOT NULL,
        preferencesNonAlcoholicTitle TEXT NOT NULL,
        cancellationTitle TEXT NOT NULL,
        cancellationDescription TEXT NOT NULL,
        cancellationTimeLimit TEXT NOT NULL,
        cancellationCancelButton TEXT NOT NULL,
        cancellationModalTitle TEXT NOT NULL,
        cancellationModalMessage TEXT NOT NULL,
        cancellationKeepButton TEXT NOT NULL,
        cancellationConfirmButton TEXT NOT NULL,
        cancellationSuccessMessage TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS guests (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        table_name TEXT NOT NULL,
        email TEXT,
        rsvpStatus TEXT,
        invitationLink TEXT,
        messageSender TEXT
      );

      CREATE TABLE IF NOT EXISTS guest_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guestId TEXT NOT NULL,
        message TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (guestId) REFERENCES guests(id)
      );

      CREATE TABLE IF NOT EXISTS guest_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guestId TEXT NOT NULL,
        alcoholicDrinks TEXT NOT NULL,
        nonAlcoholicDrinks TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (guestId) REFERENCES guests(id)
      );
    `;

    this.db.exec(createTableSQL);
  }

  private async insertDefaultData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const defaultData: Omit<WeddingData, 'id'> = {
      groomName: "Isaac",
      brideName: "Feza",
      couplePhoto: "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
      weddingDay: "09",
      weddingMonth: "NOVEMBRE",
      weddingYear: "2024",
      weddingDayOfWeek: "SAMEDI",
      weddingTime: "15:30",
      ceremonyTime: "15h30",
      ceremonyVenue: "Église ciel ouvert",
      ceremonyAddress: "Av. KONGAWI n°12, Q/Kinsuka-pecheur, C/Ngaliema",
      receptionTime: "20h00",
      receptionVenue: "Salle de fête food market (macampagne)",
      receptionAddress: "Av.Nguma, Réf. église Catholique saint Luc",
      guestName: "Monsieur et Madame MUKENDI",
      guestTable: "Table Marbre",
      alcoholicDrinks: JSON.stringify(['Bière', 'Vin rouge', 'Vin blanc', 'Champagne', 'Whisky', 'Vodka']),
      nonAlcoholicDrinks: JSON.stringify(['Eau', 'Jus de fruits', 'Soda', 'Café', 'Thé', 'Jus de gingembre']),
      welcomeMessage: "Request the pleasure of your company at the ceremony of their wedding",
      invitationTitle: "Notre Invitation",
      invitationLoveQuote: "Parce que notre amour est fort et sincère, Parce qu'il mérite d'être célébré.",
      invitationMainMessage: "Isaac et Feza ont le plaisir de vous inviter à leur mariage religieux 💍 accompagné d'une soirée festive 🥂",
      invitationDateMessage: "Le samedi 09 Novembre 2024",
      programTitle: "Programme de la Journée",
      ceremonyTitle: "Bénédiction Nuptiale",
      receptionTitle: "Soirée Dansante",
      programWelcomeMessage: "Cordiale Bienvenue ✨",
      guestbookTitle: "Livre d'or",
      guestbookSubtitle: "Laissez un petit mot aux mariés pour immortaliser ce moment",
      guestbookPlaceholder: "Écrivez votre message ici...",
      guestbookSaveButton: "Enregistrer le message",
      preferencesTitle: "Vos Préférences",
      preferencesSubtitle: "Que désirez-vous boire 🍻 ?",
      preferencesDescription: "Aidez les mariés dans la planification en suggérant vos goûts",
      preferencesLimitation: "(Deux choix maximum par catégorie)",
      preferencesAlcoholicTitle: "Boissons alcoolisées",
      preferencesNonAlcoholicTitle: "Boissons non alcoolisées",
      cancellationTitle: "Annulation d'invitation",
      cancellationDescription: "En cas d'indisponibilité, cliquez sur le bouton ci-dessous pour annuler votre invitation",
      cancellationTimeLimit: "4 jours avant la manifestation",
      cancellationCancelButton: "Annuler l'invitation",
      cancellationModalTitle: "Annuler l'invitation",
      cancellationModalMessage: "Êtes-vous sûr de vouloir annuler votre invitation ? Cette action ne peut pas être annulée.",
      cancellationKeepButton: "Garder l'invitation",
      cancellationConfirmButton: "Confirmer l'annulation",
      cancellationSuccessMessage: "Invitation annulée avec succès",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const insertSQL = `
      INSERT INTO wedding_data (
        groomName, brideName, couplePhoto, weddingDay, weddingMonth, weddingYear,
        weddingDayOfWeek, weddingTime, ceremonyTime, ceremonyVenue, ceremonyAddress,
        receptionTime, receptionVenue, receptionAddress, guestName, guestTable,
        alcoholicDrinks, nonAlcoholicDrinks, welcomeMessage, invitationTitle,
        invitationLoveQuote, invitationMainMessage, invitationDateMessage,
        programTitle, ceremonyTitle, receptionTitle, programWelcomeMessage,
        guestbookTitle, guestbookSubtitle, guestbookPlaceholder, guestbookSaveButton,
        preferencesTitle, preferencesSubtitle, preferencesDescription, preferencesLimitation,
        preferencesAlcoholicTitle, preferencesNonAlcoholicTitle, cancellationTitle,
        cancellationDescription, cancellationTimeLimit, cancellationCancelButton,
        cancellationModalTitle, cancellationModalMessage, cancellationKeepButton,
        cancellationConfirmButton, cancellationSuccessMessage, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    this.db.run(insertSQL, Object.values(defaultData));

    // Ajouter quelques invités de test
    const testGuests = [
      {
        id: 'guest-001',
        name: 'Monsieur et Madame MUKENDI',
        table_name: 'Table Marbre',
        email: 'mukendi@example.com',
        rsvpStatus: 'pending',
        invitationLink: 'https://loventy.com/i/guest-001',
        messageSender: 'Isaac et Feza'
      },
      {
        id: 'guest-002',
        name: 'Mademoiselle Sarah KABONGO',
        table_name: 'Table Cristal',
        email: 'sarah.k@example.com',
        rsvpStatus: 'confirmed',
        invitationLink: 'https://loventy.com/i/guest-002',
        messageSender: 'Isaac et Feza'
      },
      {
        id: 'guest-003',
        name: 'Docteur Jean-Pierre LUBALA',
        table_name: 'Table Or',
        email: 'jp.lubala@example.com',
        rsvpStatus: 'pending',
        invitationLink: 'https://loventy.com/i/guest-003',
        messageSender: 'Isaac et Feza'
      }
    ];

    for (const guest of testGuests) {
      const guestSQL = `
        INSERT INTO guests (id, name, table_name, email, rsvpStatus, invitationLink, messageSender)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      this.db.run(guestSQL, [guest.id, guest.name, guest.table_name, guest.email, guest.rsvpStatus, guest.invitationLink, guest.messageSender]);
    }

    this.saveToLocalStorage();
  }

  async getWeddingData(): Promise<WeddingData | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec('SELECT * FROM wedding_data ORDER BY id DESC LIMIT 1');
    
    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const row = result[0].values[0];
    const columns = result[0].columns;
    
    const data: any = {};
    columns.forEach((column, index) => {
      data[column] = row[index];
    });

    return data as WeddingData;
  }

  async saveWeddingData(data: WeddingDataInput): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const updateData = {
      ...data,
      alcoholicDrinks: JSON.stringify(data.alcoholicDrinks),
      nonAlcoholicDrinks: JSON.stringify(data.nonAlcoholicDrinks),
      updatedAt: new Date().toISOString()
    };

    const updateSQL = `
      UPDATE wedding_data SET
        groomName = ?, brideName = ?, couplePhoto = ?, weddingDay = ?, weddingMonth = ?,
        weddingYear = ?, weddingDayOfWeek = ?, weddingTime = ?, ceremonyTime = ?,
        ceremonyVenue = ?, ceremonyAddress = ?, receptionTime = ?, receptionVenue = ?,
        receptionAddress = ?, guestName = ?, guestTable = ?, alcoholicDrinks = ?,
        nonAlcoholicDrinks = ?, welcomeMessage = ?, invitationTitle = ?, invitationLoveQuote = ?,
        invitationMainMessage = ?, invitationDateMessage = ?, programTitle = ?, ceremonyTitle = ?,
        receptionTitle = ?, programWelcomeMessage = ?, guestbookTitle = ?, guestbookSubtitle = ?,
        guestbookPlaceholder = ?, guestbookSaveButton = ?, preferencesTitle = ?, preferencesSubtitle = ?,
        preferencesDescription = ?, preferencesLimitation = ?, preferencesAlcoholicTitle = ?,
        preferencesNonAlcoholicTitle = ?, cancellationTitle = ?, cancellationDescription = ?,
        cancellationTimeLimit = ?, cancellationCancelButton = ?, cancellationModalTitle = ?,
        cancellationModalMessage = ?, cancellationKeepButton = ?, cancellationConfirmButton = ?,
        cancellationSuccessMessage = ?, updatedAt = ?
      WHERE id = (SELECT MAX(id) FROM wedding_data)
    `;

    this.db.run(updateSQL, Object.values(updateData));
    this.saveToLocalStorage();
  }

  async saveGuestMessage(guestId: string, message: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const insertSQL = `
      INSERT INTO guest_messages (guestId, message, createdAt)
      VALUES (?, ?, ?)
    `;

    this.db.run(insertSQL, [guestId, message, new Date().toISOString()]);
    this.saveToLocalStorage();
  }

  async saveGuestPreferences(guestId: string, alcoholicDrinks: string[], nonAlcoholicDrinks: string[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Delete existing preferences for this guest
    this.db.run('DELETE FROM guest_preferences WHERE guestId = ?', [guestId]);

    // Insert new preferences
    const insertSQL = `
      INSERT INTO guest_preferences (guestId, alcoholicDrinks, nonAlcoholicDrinks, createdAt)
      VALUES (?, ?, ?, ?)
    `;

    this.db.run(insertSQL, [
      guestId,
      JSON.stringify(alcoholicDrinks),
      JSON.stringify(nonAlcoholicDrinks),
      new Date().toISOString()
    ]);
    this.saveToLocalStorage();
  }

  async getGuestMessages(): Promise<Array<{id: number, guestId: string, message: string, createdAt: string}>> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec('SELECT * FROM guest_messages ORDER BY createdAt DESC');
    if (result.length === 0) return [];
    return result[0].values.map(row => ({
      id: row[0] as number,
      guestId: row[1] as string,
      message: row[2] as string,
      createdAt: row[3] as string
    }));
  }

  async getGuestPreferences(): Promise<Array<{id: number, guestId: string, alcoholicDrinks: string[], nonAlcoholicDrinks: string[], createdAt: string}>> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec('SELECT * FROM guest_preferences ORDER BY createdAt DESC');
    if (result.length === 0) return [];
    return result[0].values.map(row => ({
      id: row[0] as number,
      guestId: row[1] as string,
      alcoholicDrinks: JSON.parse(row[2] as string),
      nonAlcoholicDrinks: JSON.parse(row[3] as string),
      createdAt: row[4] as string
    }));
  }

  private saveToLocalStorage(): void {
    if (!this.db) return;
    
    const data = this.db.export();
    const dataArray = Array.from(data);
    localStorage.setItem('wedding_database', JSON.stringify(dataArray));
  }

  async exportDatabase(): Promise<Uint8Array> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.export();
  }

  async importDatabase(data: Uint8Array): Promise<void> {
    const SQL = await initSqlJs({
      locateFile: (file) => `/wasm/${file}`
    });
    
    this.db = new SQL.Database(data);
    this.saveToLocalStorage();
  }

  async addGuest(
    id: string,
    name: string,
    table_name: string,
    email: string = '',
    rsvpStatus: string = '',
    invitationLink: string = '',
    messageSender: string = ''
  ): Promise<void> {
    console.log('Adding guest:', { id, name, table_name, email, rsvpStatus, invitationLink, messageSender });
    if (!this.db) {
      console.error('Database not initialized in addGuest');
      throw new Error('Database not initialized');
    }
    try {
      const stmt = this.db.prepare(`
        INSERT INTO guests (id, name, table_name, email, rsvpStatus, invitationLink, messageSender)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run([id, name, table_name, email, rsvpStatus, invitationLink, messageSender]);
      stmt.free();
      console.log('Guest added successfully');
      this.saveToLocalStorage();
      console.log('Database saved to localStorage');
      const result = this.db.exec('SELECT * FROM guests WHERE id = ?', [id]);
      console.log('Verification - Guest in database:', result);
    } catch (error) {
      console.error('Error adding guest:', error);
      throw error;
    }
  }

  async updateGuestInvitationLinkAndMessage(id: string, invitationLink: string, messageSender: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const updateSQL = `UPDATE guests SET invitationLink = ?, messageSender = ? WHERE id = ?`;
    this.db.run(updateSQL, [invitationLink, messageSender, id]);
    this.saveToLocalStorage();
  }

  async getGuests(): Promise<Array<{id: string, name: string, table_name: string, email?: string, rsvpStatus?: string, invitationLink?: string, messageSender?: string}>> {
    if (!this.db) throw new Error('Database not initialized');
    const result = this.db.exec('SELECT * FROM guests');
    if (result.length === 0) return [];
    return result[0].values.map(row => ({
      id: row[0] as string,
      name: row[1] as string,
      table_name: row[2] as string,
      email: row[3] as string,
      rsvpStatus: row[4] as string,
      invitationLink: row[5] as string,
      messageSender: row[6] as string
    }));
  }

  async updateGuestStatus(id: string, newStatus: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const updateSQL = `UPDATE guests SET rsvpStatus = ? WHERE id = ?`;
    this.db.run(updateSQL, [newStatus, id]);
    this.saveToLocalStorage();
  }

  async deleteGuest(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const deleteSQL = `DELETE FROM guests WHERE id = ?`;
    this.db.run(deleteSQL, [id]);
    this.saveToLocalStorage();
  }

  async updateGuest(id: string, name: string, table_name: string, email: string = ''): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const updateSQL = `UPDATE guests SET name = ?, table_name = ?, email = ? WHERE id = ?`;
    this.db.run(updateSQL, [name, table_name, email, id]);
    this.saveToLocalStorage();
  }
 
}

export const databaseService = new DatabaseService(); 