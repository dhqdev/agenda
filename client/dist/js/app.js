const { createApp } = Vue;
const { createRouter, createWebHistory } = VueRouter;

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Login = {
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2><i class="fas fa-calendar-alt"></i> Agenda Pessoal</h2>
        <div v-if="error" class="error-message">{{ error }}</div>
        <form @submit.prevent="login">
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="email" required>
          </div>
          <div class="form-group">
            <label for="password">Senha:</label>
            <input type="password" id="password" v-model="password" required>
          </div>
          <button type="submit" class="btn btn-primary">Entrar</button>
          <router-link to="/register" class="btn btn-secondary">Criar Conta</router-link>
        </form>
      </div>
    </div>
  `,
  data() {
    return {
      email: '',
      password: '',
      error: ''
    };
  },
  methods: {
    async login() {
      try {
        const response = await api.post('/login', {
          email: this.email,
          password: this.password
        });
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        this.$router.push('/');
      } catch (error) {
        this.error = error.response?.data?.error || 'Erro ao fazer login';
      }
    }
  }
};

const Register = {
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2><i class="fas fa-user-plus"></i> Criar Conta</h2>
        <div v-if="error" class="error-message">{{ error }}</div>
        <form @submit.prevent="register">
          <div class="form-group">
            <label for="username">Nome de usuário:</label>
            <input type="text" id="username" v-model="username" required>
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="email" required>
          </div>
          <div class="form-group">
            <label for="password">Senha:</label>
            <input type="password" id="password" v-model="password" required minlength="6">
          </div>
          <button type="submit" class="btn btn-primary">Criar Conta</button>
          <router-link to="/login" class="btn btn-secondary">Já tenho conta</router-link>
        </form>
      </div>
    </div>
  `,
  data() {
    return {
      username: '',
      email: '',
      password: '',
      error: ''
    };
  },
  methods: {
    async register() {
      try {
        const response = await api.post('/register', {
          username: this.username,
          email: this.email,
          password: this.password
        });
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        this.$router.push('/');
      } catch (error) {
        this.error = error.response?.data?.error || 'Erro ao criar conta';
      }
    }
  }
};

const Calendar = {
  template: `
    <div>
      <nav class="navbar">
        <div class="navbar-content">
          <div class="navbar-brand">
            <i class="fas fa-calendar-alt"></i> Minha Agenda
          </div>
          <div class="navbar-user">
            <span>Olá, {{ user.username }}!</span>
            <button @click="logout" class="btn btn-danger">Sair</button>
          </div>
        </div>
      </nav>
      
      <div class="container">
        <div class="calendar-container">
          <div class="calendar-header">
            <div class="calendar-nav">
              <button @click="previousMonth">
                <i class="fas fa-chevron-left"></i>
              </button>
              <div class="calendar-title">
                {{ monthNames[currentMonth] }} {{ currentYear }}
              </div>
              <button @click="nextMonth">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
            <button @click="openEventModal()" class="btn" style="background: rgba(255,255,255,0.2); color: white;">
              <i class="fas fa-plus"></i> Novo Evento
            </button>
          </div>
          
          <div class="calendar-grid">
            <div v-for="day in dayNames" :key="day" class="calendar-day-header">
              {{ day }}
            </div>
            
            <div
              v-for="day in calendarDays"
              :key="day.date"
              :class="getDayClass(day)"
              @click="openEventModal(day.date)"
              class="calendar-day"
            >
              <div class="day-number">{{ day.day }}</div>
              <div class="day-events">
                <div
                  v-for="event in day.events"
                  :key="event.id"
                  @click.stop="viewEvent(event)"
                  class="event-item"
                >
                  {{ event.title }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="showModal" class="modal" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ modalTitle }}</h3>
            <button @click="closeModal" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div v-if="modalMode === 'form'">
            <div v-if="error" class="error-message">{{ error }}</div>
            <form @submit.prevent="saveEvent" class="event-form">
              <div class="form-group">
                <label>Título:</label>
                <input type="text" v-model="eventForm.title" required>
              </div>
              
              <div class="form-group">
                <label>Descrição:</label>
                <textarea v-model="eventForm.description"></textarea>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Data:</label>
                  <input type="date" v-model="eventForm.date" required>
                </div>
                
                <div class="form-group">
                  <label>Hora:</label>
                  <input type="time" v-model="eventForm.time" required>
                </div>
              </div>
              
              <div style="display: flex; gap: 10px;">
                <button type="submit" class="btn btn-primary">
                  {{ editingEvent ? 'Atualizar' : 'Criar' }} Evento
                </button>
                <button type="button" @click="closeModal" class="btn btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
          
          <div v-if="modalMode === 'view'" class="event-details">
            <h4>{{ selectedEvent.title }}</h4>
            <p><i class="fas fa-calendar"></i> {{ formatDate(selectedEvent.date) }}</p>
            <p><i class="fas fa-clock"></i> {{ selectedEvent.time }}</p>
            <p v-if="selectedEvent.description">
              <i class="fas fa-align-left"></i> {{ selectedEvent.description }}
            </p>
            
            <div class="event-actions">
              <button @click="editEvent(selectedEvent)" class="btn btn-primary">
                <i class="fas fa-edit"></i> Editar
              </button>
              <button @click="deleteEvent(selectedEvent.id)" class="btn btn-danger">
                <i class="fas fa-trash"></i> Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      events: [],
      showModal: false,
      modalMode: 'form',
      modalTitle: '',
      selectedEvent: null,
      editingEvent: false,
      error: '',
      eventForm: {
        title: '',
        description: '',
        date: '',
        time: ''
      },
      monthNames: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ],
      dayNames: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    };
  },
  computed: {
    calendarDays() {
      const firstDay = new Date(this.currentYear, this.currentMonth, 1);
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      const days = [];
      const currentDate = new Date(startDate);
      
      for (let i = 0; i < 42; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayEvents = this.events.filter(event => event.date === dateStr);
        
        days.push({
          date: dateStr,
          day: currentDate.getDate(),
          isCurrentMonth: currentDate.getMonth() === this.currentMonth,
          isToday: this.isToday(currentDate),
          events: dayEvents
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return days;
    }
  },
  async mounted() {
    await this.loadEvents();
  },
  methods: {
    async loadEvents() {
      try {
        const response = await api.get('/events', {
          params: {
            month: (this.currentMonth + 1).toString(),
            year: this.currentYear.toString()
          }
        });
        this.events = response.data;
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }
    },
    
    previousMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
      this.loadEvents();
    },
    
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
      this.loadEvents();
    },
    
    openEventModal(date = '') {
      this.modalMode = 'form';
      this.modalTitle = this.editingEvent ? 'Editar Evento' : 'Novo Evento';
      this.showModal = true;
      this.error = '';
      
      if (date && !this.editingEvent) {
        this.eventForm.date = date;
        this.eventForm.time = '09:00';
      }
    },
    
    closeModal() {
      this.showModal = false;
      this.editingEvent = false;
      this.selectedEvent = null;
      this.eventForm = {
        title: '',
        description: '',
        date: '',
        time: ''
      };
    },
    
    async saveEvent() {
      try {
        if (this.editingEvent) {
          await api.put(`/events/${this.selectedEvent.id}`, this.eventForm);
        } else {
          await api.post('/events', this.eventForm);
        }
        
        await this.loadEvents();
        this.closeModal();
      } catch (error) {
        this.error = error.response?.data?.error || 'Erro ao salvar evento';
      }
    },
    
    viewEvent(event) {
      this.selectedEvent = event;
      this.modalMode = 'view';
      this.modalTitle = 'Detalhes do Evento';
      this.showModal = true;
    },
    
    editEvent(event) {
      this.selectedEvent = event;
      this.editingEvent = true;
      this.eventForm = {
        title: event.title,
        description: event.description || '',
        date: event.date,
        time: event.time
      };
      this.openEventModal();
    },
    
    async deleteEvent(eventId) {
      if (confirm('Tem certeza que deseja excluir este evento?')) {
        try {
          await api.delete(`/events/${eventId}`);
          await this.loadEvents();
          this.closeModal();
        } catch (error) {
          this.error = error.response?.data?.error || 'Erro ao excluir evento';
        }
      }
    },
    
    getDayClass(day) {
      let classes = [];
      
      if (!day.isCurrentMonth) classes.push('other-month');
      if (day.isToday) classes.push('today');
      if (day.events.length > 0) classes.push('has-events');
      
      return classes.join(' ');
    },
    
    isToday(date) {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    },
    
    formatDate(dateStr) {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('pt-BR');
    },
    
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
    }
  }
};

const routes = [
  { path: '/', component: Calendar, meta: { requiresAuth: true } },
  { path: '/login', component: Login },
  { path: '/register', component: Register }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/register') && token) {
    next('/');
  } else {
    next();
  }
});

const app = createApp({
  template: '<router-view />'
});

app.use(router);
app.mount('#app');
