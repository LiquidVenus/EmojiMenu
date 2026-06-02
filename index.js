class EmojiGifMenu {
  constructor() {
    this.initialized = false;
    this.emojiList = [];
    this.gifList = [];
    this.currentTab = 'emojis';
    this.currentRoom = null;
    this.currentInternalRoomId = null;
    
    try {
      this.dispatch = window.jam?.dispatch;
    } catch (e) {
      console.error('[EmojiGifMenu] Failed to get dispatch:', e);
    }
    
    this.init();
  }

  init() {
    if (this.initialized) return;
    
    this.setupElements();
    this.setupTabListeners();
    this.loadEmojiData();
    this.loadGifData();
    this.setupEventListeners();

    window.resizeTo(300, 550);
    
    console.log('[EmojiGifMenu] Initialized');
    this.initialized = true;
  }

  setupElements() {
    this.emojiGrid = document.getElementById('emojiGrid');
    this.gifGrid = document.getElementById('gifGrid');
    this.searchInput = document.getElementById('searchInput');
    this.tabButtons = document.querySelectorAll('.tab-btn');
    
    if (!this.emojiGrid || !this.gifGrid || !this.searchInput) {
      console.error('[EmojiGifMenu] Required elements not found');
    }
  }

  setupTabListeners() {
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
        // Force render when tab is clicked
        if (tabName === 'gifs') {
          setTimeout(() => this.renderGifs(this.gifList), 100);
        }
      });
    });
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    
    // Update active tab button
    this.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.toggle('active', tab.id === `${tabName}-tab`);
    });
    
    // Clear and reset search
    this.searchInput.value = '';
    this.refreshCurrentTab();
  }

  setupEventListeners() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
    }
  }

  handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (this.currentTab === 'emojis') {
      if (query === '') {
        this.renderEmojis(this.emojiList);
      } else {
        const filtered = this.emojiList.filter(emoji =>
          emoji.alias.toLowerCase().includes(query)
        );
        this.renderEmojis(filtered);
      }
    } else if (this.currentTab === 'gifs') {
      if (query === '') {
        this.renderGifs(this.gifList);
      } else {
        const filtered = this.gifList.filter(gif =>
          gif.name.toLowerCase().includes(query)
        );
        this.renderGifs(filtered);
      }
    }
  }

  async loadEmojiData() {
    try {
      console.log('[EmojiGifMenu] Loading emoji data...');
      const response = await fetch('https://raw.githubusercontent.com/DrEmoji/AJPrivChat/main/Emojis/Alias.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      this.emojiList = Object.entries(data).map(([alias, imageUrl]) => ({
        alias,
        imageUrl
      }));
      
      console.log('[EmojiGifMenu] Loaded emojis:', this.emojiList.length);
      
      if (this.currentTab === 'emojis') {
        this.renderEmojis(this.emojiList);
      }
    } catch (error) {
      console.error('[EmojiGifMenu] Failed to load emojis:', error);
    }
  }

  async loadGifData() {
    try {
      console.log('[EmojiGifMenu] Loading GIF data...');
      const response = await fetch('https://raw.githubusercontent.com/LiquidVenus/EmojiMenu/main/GIFs/Alias.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      console.log('[EmojiGifMenu] Raw GIF data:', data);
      
      this.gifList = Object.entries(data).map(([name, imageUrl]) => ({
        name,
        imageUrl
      }));
      
      console.log('[EmojiGifMenu] Processed GIFs:', this.gifList);
      
      // Always render gifs if on gifs tab
      if (this.currentTab === 'gifs') {
        console.log('[EmojiGifMenu] On GIFs tab, rendering now');
        this.renderGifs(this.gifList);
      }
    } catch (error) {
      console.error('[EmojiGifMenu] Failed to load GIFs:', error);
    }
  }

  renderEmojis(emojisToShow = this.emojiList) {
    if (!this.emojiGrid) return;
    
    this.emojiGrid.innerHTML = '';
    
    emojisToShow.forEach(emoji => {
      const btn = document.createElement('button');
      btn.className = 'emoji-btn';
      btn.title = emoji.alias;
      
      const img = document.createElement('img');
      img.src = emoji.imageUrl;
      img.alt = emoji.alias;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      
      btn.appendChild(img);
      btn.addEventListener('click', () => this.sendEmoji(emoji.alias));
      
      this.emojiGrid.appendChild(btn);
    });
  }

  renderGifs(gifsToShow = this.gifList) {
    if (!this.gifGrid) {
      console.error('[EmojiGifMenu] gifGrid element not found');
      return;
    }
    
    console.log('[EmojiGifMenu] Rendering GIFs, count:', gifsToShow.length);
    this.gifGrid.innerHTML = '';
    
    if (gifsToShow.length === 0) {
      console.warn('[EmojiGifMenu] No GIFs to render');
      this.gifGrid.innerHTML = '<p>No GIFs loaded</p>';
      return;
    }
    
    gifsToShow.forEach((gif, index) => {
      console.log(`[EmojiGifMenu] Rendering GIF ${index}:`, gif);
      
      const btn = document.createElement('button');
      btn.className = 'gif-btn';
      btn.title = gif.name;
      
      const img = document.createElement('img');
      img.src = gif.imageUrl;
      img.alt = gif.name;
      img.style.display = 'block';
      
      img.onerror = (e) => {
        console.error('[EmojiGifMenu] Failed to load GIF image:', gif.imageUrl);
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="70" height="70"%3E%3Crect fill="%23ff0000" width="70" height="70"/%3E%3Ctext x="35" y="35" text-anchor="middle" dy=".3em" fill="white" font-size="10"%3E?%3C/text%3E%3C/svg%3E';
      };
      
      img.onload = () => console.log('[EmojiGifMenu] Successfully loaded GIF:', gif.name);
      
      btn.appendChild(img);
      btn.addEventListener('click', () => this.sendGif(gif.name));
      
      this.gifGrid.appendChild(btn);
    });
    
    console.log('[EmojiGifMenu] Finished rendering GIFs');
  }

  refreshCurrentTab() {
    if (this.currentTab === 'emojis') {
      this.renderEmojis(this.emojiList);
    } else if (this.currentTab === 'gifs') {
      this.renderGifs(this.gifList);
    }
  }

  async refreshRoom() {
    try {
      const roomState = await this.dispatch?.getState('room');
      this.currentRoom = roomState?.name || null;
      
      const internalRoomId = await this.dispatch?.getState('internalRoomId');
      if (internalRoomId) {
        const parsed = parseInt(internalRoomId, 10);
        if (!isNaN(parsed)) {
          this.currentInternalRoomId = parsed;
        }
      }
    } catch (e) {
      console.error('[EmojiGifMenu] Failed to refresh room:', e);
    }
  }

  getRoomIdToUse() {
    return this.currentInternalRoomId || this.currentRoom;
  }

  async sendEmoji(alias) {
    try {
      await this.refreshRoom();
      const roomId = this.getRoomIdToUse();
      
      const packet = `<msg t="sys"><body action="pubMsg" r="${roomId}"><txt><![CDATA[pe:${alias}%3%0]]></txt></body></msg>`;
      
      if (this.dispatch?.sendRemoteMessage) {
        await this.dispatch.sendRemoteMessage(packet);
      }
    } catch (error) {
      console.error('[EmojiGifMenu] Failed to send emoji:', error);
    }
  }

  async sendGif(gifName) {
    try {
      await this.refreshRoom();
      const roomId = this.getRoomIdToUse();
      
      const packet = `<msg t="sys"><body action="pubMsg" r="${roomId}"><txt><![CDATA[pg:${gifName}%3%0]]></txt></body></msg>`;
      
      if (this.dispatch?.sendRemoteMessage) {
        await this.dispatch.sendRemoteMessage(packet);
      }
    } catch (error) {
      console.error('[EmojiGifMenu] Failed to send GIF:', error);
    }
  }
}

window.emojiGifMenu = new EmojiGifMenu();
