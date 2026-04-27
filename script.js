let products = [];
let orders = [];
let supportMessages = [];
let reviews = [];

const CART_KEY = 'novaCart';
const CART_SOURCE_KEY = 'dragonCartSource';
const FAVORITES_KEY = 'dragonFavorites';
const FAVORITES_SOURCE_KEY = 'dragonFavoritesSource';
let observer;
let sentinelEl;
const THEME_KEY = 'dragonTheme';
const LANGUAGE_KEY = 'dragonLanguage';
const CURRENCY_KEY = 'dragonCurrency';
const COLLECTION_VIEW_KEY = 'dragonCollectionView';
const PRODUCT_SPECS_KEY = 'dragonProductSpecs';
const SUPPORT_MESSAGES_KEY = 'dragonSupportMessages';
const ORDER_STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'pickup', 'delivered', 'cancelled'];
const countryPool = ['Japan', 'USA', 'Germany', 'Sweden', 'UK', 'Canada', 'South Korea', 'Netherlands'];
let currentLanguage = 'en';
let currentCurrency = 'USD';
let currentPricingRegion = 'america';
let currentUser = null;
let currentUserRole = null;
let authSubscription = null;
let cartCache = null;
let cartSyncPromise = null;
let cartSyncTimer = null;
let cartHydratedUserId = null;
let cartFocusListenerBound = false;
let cartRemoteAvailable = true;
let cartRenderToken = 0;
let cartRealtimeSubscription = null;
let favoritesCache = [];
let favoritesSyncPromise = null;
let productLoadError = '';

const I18N = {
  en: {
    title: {
      home: 'Dragon Toys - Modern Store',
      products: 'Products - Dragon Toys',
      wishlist: 'Wishlist - Dragon Toys',
      cart: 'Cart - Dragon Toys',
      checkout: 'Checkout - Dragon Toys',
      profile: 'Profile - Dragon Toys',
      login: 'Login - Dragon Toys',
      register: 'Register - Dragon Toys',
      admin: 'Admin - Dragon Toys',
      product: 'Product - Dragon Toys'
    },
    nav: {
      home: 'Home',
      products: 'Products',
      wishlist: 'Wishlist',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      back: 'Back',
      switchLanguage: 'Switch language',
      switchCurrency: 'Switch currency',
      switchToLight: 'Switch to light theme',
      switchToDark: 'Switch to dark theme'
    },
    footer: {
      tagline: 'Elevated everyday essentials.',
      support: 'Support'
    },
    home: {
      eyebrow: 'Adventure-ready',
      title: 'Playful, modern toys for bold imaginations.',
      lede: 'Curated designs with tactile finishes and clever tech that keep curiosity flowing.',
      shop: 'Shop collection',
      popular: 'View popular',
      fresh: 'Fresh drop',
      popularTitle: 'Popular products',
      popularSubtitle: 'Browse the collection without leaving the page.',
      prevProducts: 'Previous products',
      nextProducts: 'Next products'
    },
    products: {
      title: 'All products',
      subtitle: 'Filter, search, and browse the full catalog.',
      searchPlaceholder: 'Search products',
      allCategories: 'All categories',
      allTags: 'All tags',
      collections: 'Collections',
      collectionEyebrow: 'Dragon Toys Collection',
      filterTitle: 'Filter collection',
      filterToggle: 'Filters',
      sortLabel: 'Sort by',
      countLabel: '{count} products',
      showingLabel: 'Showing {from}-{to} of {count}',
      availability: 'Availability',
      inStock: 'In stock',
      outOfStock: 'Out of stock',
      price: 'Price',
      minPrice: 'Min price',
      maxPrice: 'Max price',
      categoryLabel: 'Category',
      tagsLabel: 'Tags',
      applyFilters: 'Apply',
      clearAll: 'Clear all',
      sortFeatured: 'Featured',
      sortBest: 'Best selling',
      sortAZ: 'Alphabetically A-Z',
      sortZA: 'Alphabetically Z-A',
      sortPriceLow: 'Price low to high',
      sortPriceHigh: 'Price high to low',
      sortNewest: 'Newest first',
      sortOldest: 'Oldest first',
      viewGrid: 'Grid',
      viewList: 'List',
      emptyTitle: 'No products found',
      emptyText: 'Try adjusting filters or search terms.',
      quickView: 'Quick view',
      saleBadge: 'Sale',
      trustSecureTitle: 'Secure Payment',
      trustSecureText: 'Protected checkout for every order.',
      trustShippingTitle: 'Worldwide Shipping',
      trustShippingText: 'Fast delivery with careful packing.',
      trustSupportTitle: 'Customer Support',
      trustSupportText: 'Helpful answers before and after purchase.',
      trustPaymentsTitle: 'Multiple Payment Options',
      trustPaymentsText: 'Choose the payment flow that fits you best.'
    },
    cart: {
      title: 'Your cart',
      subtitle: 'Review items before checkout.',
      empty: 'Your cart is empty. Find something you love in Products.',
      browse: 'Browse products',
      summary: 'Order summary',
      total: 'Total',
      checkout: 'Checkout',
      recommended: 'Recommended for you',
      recommendedSubtitle: "Handpicked picks we think you'll like.",
      nothing: 'Nothing here yet.',
      adjust: 'Adjust quantities or remove items below.',
      each: 'each',
      category: 'Category',
      remove: 'Remove'
    },
    wishlist: {
      title: 'Wishlist',
      subtitle: 'Save favorites and come back when you are ready.',
      empty: 'Your wishlist is empty. Tap the heart on products you like.',
      browse: 'Browse products',
      added: 'Added to wishlist',
      removed: 'Removed from wishlist',
      moveToCart: 'Move to cart'
    },
    checkout: {
      title: 'Checkout',
      subtitle: 'Complete your purchase.',
      empty: 'Your cart is empty. Add some Dragon Toys to continue.',
      browse: 'Browse products',
      details: 'Payment details',
      total: 'Total',
      name: 'Name',
      email: 'Email',
      address: 'Address',
      paymentMethod: 'Payment method',
      selectPayment: 'Select payment method',
      payNow: 'Pay Now',
      processing: 'Processing payment...',
      paymentFailed: 'Payment failed. Order remains pending.',
      paymentPending: 'Payment is pending. You can complete it later.',
      paymentRequired: 'Please choose a payment method.',
      addressRequired: 'Please enter delivery address.',
      thanks: 'Thank you for your purchase!',
      fullNamePlaceholder: 'Your full name',
      emailPlaceholder: 'you@example.com',
      addressPlaceholder: 'Shipping address',
      finish: 'Enter your details to finish checkout.'
    },
    payments: {
      stripe: 'Card (Stripe)',
      russian: 'SBP / YooKassa',
      card: 'Mir / Visa / Mastercard',
      sbp: 'SBP',
      sberpay: 'SberPay',
      yoomoney: 'YuMoney',
      apple: 'Apple Pay'
    },
    auth: {
      loginTitle: 'Login',
      loginSubtitle: 'Welcome back, please sign in.',
      password: 'Password',
      noAccount: 'No account?',
      createTitle: 'Create account',
      createSubtitle: 'Join Dragon Toys and track your orders.',
      name: 'Name',
      confirmPassword: 'Confirm password',
      alreadyAccount: 'Already have an account?',
      yourName: 'Your name',
      minPassword: 'At least 6 characters',
      repeatPassword: 'Repeat password',
      registrationSuccess: 'Registration successful. Confirm your email, then log in.',
      confirmEmailNotice: 'Please confirm your email address before logging in.',
      invalidCredentials: 'Invalid credentials.',
      validEmail: 'Enter a valid email.',
      passwordMin: 'Password must be at least 6 characters.',
      passwordsMismatch: 'Passwords do not match.',
      accountExists: 'Account already exists.',
      databaseSaveError: 'Registration failed on database side. Check Supabase users table defaults/trigger and RLS policies.'
    },
    support: {
      title: 'Contact support',
      askProductTitle: 'Ask about product',
      subtitle: 'Send us a message and we will respond in admin panel.',
      name: 'Your name',
      email: 'Email',
      message: 'Message',
      messagePlaceholder: 'Describe your question...',
      product: 'Product',
      openFromFooter: 'Support',
      askButton: 'Ask about product',
      send: 'Send message',
      sending: 'Sending...',
      cancel: 'Cancel',
      success: 'Message sent successfully.',
      error: 'Failed to send message. Try again.'
    },
    profile: {
      title: 'Your profile',
      subtitle: 'Track active orders and revisit your history.',
      role: 'Role',
      history: 'Order history',
      historySubtitle: 'Recent orders and delivery details.',
      noOrders: 'No orders yet.',
      noHistory: 'No previous orders yet.',
      currentOrder: 'Current order',
      order: 'Order',
      status: 'Status',
      items: 'Items',
      noProducts: 'No products in this order.',
      ordersCount: 'Orders',
      activeOrders: 'Active orders',
      lastOrder: 'Last order',
      activeOrderTitle: 'Active order overview',
      activeOrderSubtitle: 'Your latest order with quick delivery details.',
      placedOn: 'Placed on',
      tracking: 'Delivery progress',
      timelineTitle: 'Delivery timeline',
      address: 'Address',
      paymentMethod: 'Payment method',
      productsCount: '{count} products',
      viewProduct: 'View product',
      showDetails: 'View details',
      hideDetails: 'Hide details'
    },
    admin: {
      title: 'Admin Panel',
      subtitle: 'Manage products and view orders.',
      tabProducts: 'Products',
      tabOrders: 'Orders',
      tabReviews: 'Reviews',
      tabQuestions: 'Questions',
      manageProducts: 'Product Management',
      name: 'Name',
      price: 'Price',
      imageUrl: 'Image URL',
      galleryImages: 'Gallery images (comma URLs)',
      basePrice: 'Base price',
      baseRegion: 'Base region',
      regionalPricing: 'Regional pricing',
      regionalPricingHint: 'Use one base price and adjust regional prices when needed.',
      autoFillRegional: 'Auto-fill regional prices',
      pricingCurrency: 'Currency',
      formBasic: 'Basic',
      formMedia: 'Media',
      formPricing: 'Pricing',
      formSafety: 'Safety',
      formSpecs: 'Specs',
      regionAmerica: 'America',
      regionEurope: 'Europe',
      regionEurasia: 'Eurasia',
      regionAsia: 'Asia',
      regionOceania: 'Oceania',
      modelUrl: '3D model URL (.glb)',
      show3d: 'Show 3D model on product page',
      imageDropTitle: 'Drop image here',
      imageDropText: 'or click to choose a file',
      galleryDropTitle: 'Drop gallery images here',
      galleryDropText: 'or click to add multiple files',
      description: 'Description',
      country: 'Country',
      size: 'Size',
      category: 'Category',
      quantity: 'Quantity',
      ageRating: 'Age rating',
      ageRatingPlaceholder: 'e.g., 3+',
      materials: 'Materials',
      materialsPlaceholder: 'ABS plastic, silicone',
      certifications: 'Certificates',
      certificationsPlaceholder: 'CE, ASTM F963',
      safetyWarnings: 'Safety warnings',
      safetyWarningsPlaceholder: 'Contains small parts. Adult supervision recommended.',
      color: 'Color',
      colorPlaceholder: 'Red, Blue, Black',
      tags: 'Tags (comma separated)',
      specsEditor: 'Characteristics',
      addSpec: '+ Add characteristic',
      specName: 'Name',
      specValue: 'Value',
      removeSpec: 'Remove characteristic',
      saveProduct: 'Save product',
      products: 'Products',
      orders: 'Orders',
      reviews: 'Reviews',
      noReviews: 'No reviews yet.',
      reviewRating: 'Rating',
      reviewComment: 'Comment',
      reviewStatus: 'Review status',
      reviewApprove: 'Approve',
      reviewReject: 'Reject',
      reviewDelete: 'Delete review',
      questions: 'Questions',
      noQuestions: 'No messages yet.',
      from: 'From',
      source: 'Source',
      sourceSupport: 'Support',
      sourceProduct: 'Product question',
      questionText: 'Question',
      reply: 'Reply',
      sendReply: 'Send reply',
      replyPlaceholder: 'Type your response...',
      savedAnswer: 'Answer saved.',
      statusNew: 'New',
      statusAnswered: 'Answered',
      edit: 'Edit',
      delete: 'Delete',
      status: 'Status',
      qty: 'Qty',
      saveSuccess: 'Product saved.',
      enterNamePrice: 'Enter name and valid price.'
    },
    product: {
      loading: 'Loading...',
      reviews: 'reviews',
      ratingBasedOn: 'Based on {count} reviews',
      photosTab: 'Photos',
      modelTab: '3D',
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      addToWishlist: 'Add to wishlist',
      removeFromWishlist: 'Remove from wishlist',
      askQuestion: 'Ask about product',
      specsButton: 'Characteristics',
      specsTitle: 'Product characteristics',
      tabDescription: 'Description',
      tabDetails: 'Details',
      tabSafety: 'Safety',
      tabReviews: 'Reviews',
      relatedTitle: 'You may also like',
      relatedSubtitle: 'Similar products from our collection.',
      prevRelated: 'Previous products',
      nextRelated: 'Next products',
      notFound: 'Product not found.',
      backToCatalog: 'Back to catalog',
      inStock: 'In stock',
      onlyLeft: 'Only {count} left',
      outOfStock: 'Out of stock',
      color: 'Color',
      ageRating: 'Age',
      materials: 'Materials',
      certifications: 'Certificates',
      safetyWarnings: 'Warnings',
      safetyTitle: 'Safety & care',
      safetySubtitle: 'Age guidance, materials and important usage notes.',
      type: 'Type',
      transport: 'Transport',
      control: 'Control',
      features: 'Features',
      country: 'Country',
      size: 'Size',
      reviewTitle: 'Customer reviews',
      reviewSubtitle: 'See what buyers say about this model.',
      reviewEmpty: 'There are no approved reviews yet.',
      reviewFormTitle: 'Leave a review',
      reviewPurchasedOnly: 'You can leave a review after purchasing this product.',
      reviewPending: 'Your review is awaiting moderation.',
      reviewRejected: 'Your previous review was rejected. You can update it and submit again.',
      reviewSubmitted: 'Review sent for moderation.',
      reviewRatingLabel: 'Your rating',
      reviewCommentLabel: 'Your review',
      reviewCommentPlaceholder: 'Share what you liked, build quality, delivery impression...',
      reviewSubmit: 'Submit review'
    },
    common: {
      product: 'Product',
      general: 'General',
      dash: '—',
      addedToCart: '{name} added to cart',
      unavailable: 'Out of stock',
      limitReached: 'Stock limit reached',
      close: 'Close',
      delivery: 'Delivery',
      viewProduct: 'View Product',
      notSpecified: 'Not specified',
      status: 'Status'
    },
    orderStatus: {
      pending: 'Order placed',
      processing: 'Preparing at warehouse',
      shipped: 'Shipped',
      pickup: 'Waiting at pickup point',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    }
  },
  ru: {
    title: {
      home: 'Dragon Toys - Современный магазин',
      products: 'Товары - Dragon Toys',
      wishlist: 'Избранное - Dragon Toys',
      cart: 'Корзина - Dragon Toys',
      checkout: 'Оформление - Dragon Toys',
      profile: 'Профиль - Dragon Toys',
      login: 'Вход - Dragon Toys',
      register: 'Регистрация - Dragon Toys',
      admin: 'Админ-панель - Dragon Toys',
      product: 'Товар - Dragon Toys'
    },
    nav: {
      home: 'Главная',
      products: 'Товары',
      wishlist: 'Избранное',
      login: 'Войти',
      register: 'Регистрация',
      logout: 'Выйти',
      back: 'Назад',
      switchLanguage: 'Сменить язык',
      switchCurrency: 'Сменить валюту',
      switchToLight: 'Переключить на светлую тему',
      switchToDark: 'Переключить на тёмную тему'
    },
    footer: {
      tagline: 'Стильные товары на каждый день.',
      support: 'Поддержка'
    },
    home: {
      eyebrow: 'Готово к приключениям',
      title: 'Современные игрушки для смелого воображения.',
      lede: 'Подборка стильных игрушек с приятными материалами и умными деталями, которые поддерживают интерес к игре.',
      shop: 'Смотреть каталог',
      popular: 'Популярное',
      fresh: 'Новая коллекция',
      popularTitle: 'Популярные товары',
      popularSubtitle: 'Смотрите подборку прямо на главной странице.',
      prevProducts: 'Предыдущие товары',
      nextProducts: 'Следующие товары'
    },
    products: {
      title: 'Все товары',
      subtitle: 'Ищите, фильтруйте и просматривайте весь каталог.',
      searchPlaceholder: 'Поиск товаров',
      allCategories: 'Все категории',
      allTags: 'Все теги',
      collections: 'Коллекции',
      collectionEyebrow: 'Коллекция Dragon Toys',
      filterTitle: 'Фильтры коллекции',
      filterToggle: 'Фильтры',
      sortLabel: 'Сортировка',
      countLabel: '{count} товаров',
      showingLabel: 'Показано {from}-{to} из {count}',
      availability: 'Наличие',
      inStock: 'В наличии',
      outOfStock: 'Нет в наличии',
      price: 'Цена',
      minPrice: 'Цена от',
      maxPrice: 'Цена до',
      categoryLabel: 'Категория',
      tagsLabel: 'Теги',
      applyFilters: 'Применить',
      clearAll: 'Сбросить всё',
      sortFeatured: 'Рекомендуемые',
      sortBest: 'Хиты продаж',
      sortAZ: 'По алфавиту A-Z',
      sortZA: 'По алфавиту Z-A',
      sortPriceLow: 'Цена по возрастанию',
      sortPriceHigh: 'Цена по убыванию',
      sortNewest: 'Сначала новые',
      sortOldest: 'Сначала старые',
      viewGrid: 'Сетка',
      viewList: 'Список',
      emptyTitle: 'Товары не найдены',
      emptyText: 'Попробуйте изменить фильтры или поисковый запрос.',
      quickView: 'Быстрый просмотр',
      saleBadge: 'Скидка',
      trustSecureTitle: 'Безопасная оплата',
      trustSecureText: 'Защищенный checkout для каждого заказа.',
      trustShippingTitle: 'Доставка по миру',
      trustShippingText: 'Быстрая доставка и бережная упаковка.',
      trustSupportTitle: 'Поддержка клиентов',
      trustSupportText: 'Помогаем до покупки и после неё.',
      trustPaymentsTitle: 'Несколько способов оплаты',
      trustPaymentsText: 'Выберите оплату, которая удобна именно вам.'
    },
    cart: {
      title: 'Корзина',
      subtitle: 'Проверьте товары перед оформлением.',
      empty: 'Корзина пуста. Найдите что-нибудь интересное в каталоге.',
      browse: 'Перейти к товарам',
      summary: 'Сумма заказа',
      total: 'Итого',
      checkout: 'Оформить заказ',
      recommended: 'Рекомендуем для вас',
      recommendedSubtitle: 'Мы подобрали товары, которые могут вам понравиться.',
      nothing: 'Здесь пока ничего нет.',
      adjust: 'Измените количество или удалите товары ниже.',
      each: 'за штуку',
      category: 'Категория',
      remove: 'Удалить'
    },
    wishlist: {
      title: 'Избранное',
      subtitle: 'Сохраняйте понравившиеся товары и возвращайтесь к ним позже.',
      empty: 'Избранное пока пусто. Нажимайте на сердечко у понравившихся товаров.',
      browse: 'Перейти к товарам',
      added: 'Добавлено в избранное',
      removed: 'Удалено из избранного',
      moveToCart: 'В корзину'
    },
    checkout: {
      title: 'Оформление заказа',
      subtitle: 'Завершите покупку.',
      empty: 'Корзина пуста. Добавьте товары Dragon Toys, чтобы продолжить.',
      browse: 'Перейти к товарам',
      details: 'Данные для оплаты',
      total: 'Итого',
      name: 'Имя',
      email: 'Email',
      address: 'Адрес',
      paymentMethod: 'Способ оплаты',
      selectPayment: 'Выберите способ оплаты',
      payNow: 'Оплатить',
      processing: 'Обрабатываем платеж...',
      paymentFailed: 'Оплата не прошла. Заказ сохранён со статусом pending.',
      paymentPending: 'Платёж в ожидании. Его можно завершить позже.',
      paymentRequired: 'Выберите способ оплаты.',
      addressRequired: 'Введите адрес доставки.',
      thanks: 'Спасибо за покупку!',
      fullNamePlaceholder: 'Ваше полное имя',
      emailPlaceholder: 'you@example.com',
      addressPlaceholder: 'Адрес доставки',
      finish: 'Введите данные, чтобы завершить оформление.'
    },
    payments: {
      stripe: 'Карта (Stripe)',
      russian: 'СБП / YooKassa',
      card: 'Карта Мир / Visa / Mastercard',
      sbp: 'СБП',
      sberpay: 'SberPay',
      yoomoney: 'ЮMoney',
      apple: 'Apple Pay'
    },
    auth: {
      loginTitle: 'Вход',
      loginSubtitle: 'С возвращением, войдите в аккаунт.',
      password: 'Пароль',
      noAccount: 'Нет аккаунта?',
      createTitle: 'Создать аккаунт',
      createSubtitle: 'Присоединяйтесь к Dragon Toys и отслеживайте свои заказы.',
      name: 'Имя',
      confirmPassword: 'Подтвердите пароль',
      alreadyAccount: 'Уже есть аккаунт?',
      yourName: 'Ваше имя',
      minPassword: 'Минимум 6 символов',
      repeatPassword: 'Повторите пароль',
      registrationSuccess: 'Регистрация прошла успешно. Подтвердите email, затем войдите.',
      confirmEmailNotice: 'Подтвердите почту перед входом в аккаунт.',
      invalidCredentials: 'Неверный email или пароль.',
      validEmail: 'Введите корректный email.',
      passwordMin: 'Пароль должен содержать минимум 6 символов.',
      passwordsMismatch: 'Пароли не совпадают.',
      accountExists: 'Аккаунт с таким email уже существует.',
      databaseSaveError: 'Ошибка сохранения в базе. Проверьте таблицу users, триггер и RLS-политики в Supabase.'
    },
    support: {
      title: 'Поддержка',
      askProductTitle: 'Вопрос о товаре',
      subtitle: 'Отправьте сообщение, и администратор ответит вам в панели.',
      name: 'Ваше имя',
      email: 'Email',
      message: 'Сообщение',
      messagePlaceholder: 'Опишите ваш вопрос...',
      product: 'Товар',
      openFromFooter: 'Поддержка',
      askButton: 'Задать вопрос о товаре',
      send: 'Отправить',
      sending: 'Отправка...',
      cancel: 'Отмена',
      success: 'Сообщение отправлено.',
      error: 'Не удалось отправить сообщение. Попробуйте снова.'
    },
    profile: {
      title: 'Ваш профиль',
      subtitle: 'Следите за активными заказами и историей покупок.',
      role: 'Роль',
      history: 'История заказов',
      historySubtitle: 'Недавние заказы и детали доставки.',
      noOrders: 'Заказов пока нет.',
      noHistory: 'Предыдущих заказов пока нет.',
      currentOrder: 'Текущий заказ',
      order: 'Заказ',
      status: 'Статус',
      items: 'Товары',
      noProducts: 'В этом заказе нет товаров.',
      ordersCount: 'Заказы',
      activeOrders: 'Активные заказы',
      lastOrder: 'Последний заказ',
      activeOrderTitle: 'Обзор активного заказа',
      activeOrderSubtitle: 'Ваш последний заказ и быстрые детали доставки.',
      placedOn: 'Оформлен',
      tracking: 'Движение заказа',
      timelineTitle: 'Статус доставки',
      address: 'Адрес',
      paymentMethod: 'Способ оплаты',
      productsCount: '{count} товаров',
      viewProduct: 'Смотреть товар',
      showDetails: 'Смотреть детали',
      hideDetails: 'Скрыть детали'
    },
    admin: {
      title: 'Админ-панель',
      subtitle: 'Управляйте товарами и просматривайте заказы.',
      tabProducts: 'Товары',
      tabOrders: 'Заказы',
      tabReviews: 'Отзывы',
      tabQuestions: 'Вопросы',
      manageProducts: 'Управление товарами',
      name: 'Название',
      price: 'Цена',
      imageUrl: 'URL изображения',
      galleryImages: 'Галерея (URL через запятую)',
      basePrice: 'Базовая цена',
      baseRegion: 'Базовый регион',
      regionalPricing: 'Региональные цены',
      regionalPricingHint: 'Используйте одну базовую цену и при необходимости скорректируйте цены по регионам.',
      autoFillRegional: 'Автозаполнить региональные цены',
      pricingCurrency: 'Валюта',
      formBasic: 'Основное',
      formMedia: 'Фото',
      formPricing: 'Цены',
      formSafety: 'Безопасность',
      formSpecs: 'Характеристики',
      regionAmerica: 'Америка',
      regionEurope: 'Европа',
      regionEurasia: 'Евразия',
      regionAsia: 'Азия',
      regionOceania: 'Океания',
      modelUrl: 'URL 3D модели (.glb)',
      show3d: 'Показывать 3D модель на странице товара',
      imageDropTitle: 'Перетащите изображение сюда',
      imageDropText: 'или нажмите, чтобы выбрать файл',
      galleryDropTitle: 'Перетащите изображения галереи сюда',
      galleryDropText: 'или нажмите, чтобы добавить несколько файлов',
      description: 'Описание',
      country: 'Страна',
      size: 'Размер',
      category: 'Категория',
      quantity: 'Количество',
      ageRating: 'Возраст',
      ageRatingPlaceholder: 'например, 3+',
      materials: 'Материалы',
      materialsPlaceholder: 'ABS-пластик, силикон',
      certifications: 'Сертификаты',
      certificationsPlaceholder: 'CE, ASTM F963',
      safetyWarnings: 'Предупреждения',
      safetyWarningsPlaceholder: 'Содержит мелкие детали. Рекомендуется присмотр взрослых.',
      color: 'Цвет',
      colorPlaceholder: 'Красный, Синий, Черный',
      tags: 'Теги (через запятую)',
      specsEditor: 'Характеристики',
      addSpec: '+ Добавить характеристику',
      specName: 'Название',
      specValue: 'Значение',
      removeSpec: 'Удалить характеристику',
      saveProduct: 'Сохранить товар',
      products: 'Товары',
      orders: 'Заказы',
      reviews: 'Отзывы',
      noReviews: 'Отзывов пока нет.',
      reviewRating: 'Оценка',
      reviewComment: 'Текст',
      reviewStatus: 'Статус отзыва',
      reviewApprove: 'Одобрить',
      reviewReject: 'Отклонить',
      reviewDelete: 'Удалить отзыв',
      questions: 'Вопросы',
      noQuestions: 'Сообщений пока нет.',
      from: 'От кого',
      source: 'Источник',
      sourceSupport: 'Поддержка',
      sourceProduct: 'Вопрос о товаре',
      questionText: 'Вопрос',
      reply: 'Ответ',
      sendReply: 'Отправить ответ',
      replyPlaceholder: 'Введите ответ...',
      savedAnswer: 'Ответ сохранён.',
      statusNew: 'Новый',
      statusAnswered: 'Отвечен',
      edit: 'Изменить',
      delete: 'Удалить',
      status: 'Статус',
      qty: 'Кол-во',
      saveSuccess: 'Товар сохранён.',
      enterNamePrice: 'Введите название и корректную цену.'
    },
    product: {
      loading: 'Загрузка...',
      reviews: 'отзывов',
      ratingBasedOn: 'Основано на {count} отзывах',
      photosTab: 'Фото',
      modelTab: '3D',
      addToCart: 'В корзину',
      buyNow: 'Купить сейчас',
      addToWishlist: 'В избранное',
      removeFromWishlist: 'Убрать из избранного',
      askQuestion: 'Задать вопрос о товаре',
      specsButton: 'Характеристики',
      specsTitle: 'Характеристики товара',
      tabDescription: 'Описание',
      tabDetails: 'Детали',
      tabSafety: 'Безопасность',
      tabReviews: 'Отзывы',
      relatedTitle: 'Похожие товары',
      relatedSubtitle: 'Другие товары, которые могут вам понравиться.',
      prevRelated: 'Предыдущие товары',
      nextRelated: 'Следующие товары',
      notFound: 'Товар не найден.',
      backToCatalog: 'Вернуться в каталог',
      inStock: 'В наличии',
      onlyLeft: 'Осталось {count} шт.',
      outOfStock: 'Нет в наличии',
      color: 'Цвет',
      ageRating: 'Возраст',
      materials: 'Материалы',
      certifications: 'Сертификаты',
      safetyWarnings: 'Предупреждения',
      safetyTitle: 'Безопасность и уход',
      safetySubtitle: 'Возрастные рекомендации, материалы и важные примечания по использованию.',
      type: 'Тип',
      transport: 'Транспорт',
      control: 'Управление',
      features: 'Особенности',
      country: 'Страна',
      size: 'Размер',
      reviewTitle: 'Отзывы покупателей',
      reviewSubtitle: 'Посмотрите, что говорят покупатели об этой модели.',
      reviewEmpty: 'Пока нет одобренных отзывов.',
      reviewFormTitle: 'Оставить отзыв',
      reviewPurchasedOnly: 'Оставить отзыв можно после покупки этого товара.',
      reviewPending: 'Ваш отзыв отправлен и ждёт модерации.',
      reviewRejected: 'Предыдущий отзыв был отклонён. Можно исправить и отправить заново.',
      reviewSubmitted: 'Отзыв отправлен на модерацию.',
      reviewRatingLabel: 'Ваша оценка',
      reviewCommentLabel: 'Ваш отзыв',
      reviewCommentPlaceholder: 'Расскажите о качестве, впечатлении от товара и доставке...',
      reviewSubmit: 'Отправить отзыв'
    },
    common: {
      product: 'Товар',
      general: 'Общее',
      dash: '—',
      addedToCart: '{name} добавлен в корзину',
      unavailable: 'Нет в наличии',
      limitReached: 'Достигнут лимит по наличию',
      close: 'Закрыть',
      delivery: 'Доставка',
      viewProduct: 'Посмотреть товар',
      notSpecified: 'Не указано',
      status: 'Статус'
    },
    orderStatus: {
      pending: 'Заказ оформлен',
      processing: 'Собирается на складе',
      shipped: 'В пути',
      pickup: 'Ждёт на пункте выдачи',
      delivered: 'Доставлен',
      cancelled: 'Отменён'
    }
  }
};

const translateTemplate = (value, vars = {}) =>
  String(value).replace(/\{(\w+)\}/g, (_, key) => (vars[key] ?? ''));

const t = (key, vars = {}) => {
  const parts = key.split('.');
  let value = I18N[currentLanguage];
  for (const part of parts) {
    value = value?.[part];
  }
  if (typeof value !== 'string') return key;
  return translateTemplate(value, vars);
};

const CURRENCY_CONFIG = {
  USD: { locale: 'en-US', minimumFractionDigits: 0, maximumFractionDigits: 2, usdRate: 1 },
  EUR: { locale: 'de-DE', minimumFractionDigits: 0, maximumFractionDigits: 2, usdRate: 1.08 },
  GBP: { locale: 'en-GB', minimumFractionDigits: 0, maximumFractionDigits: 2, usdRate: 1.27 },
  RUB: { locale: 'ru-RU', minimumFractionDigits: 0, maximumFractionDigits: 0, usdRate: 0.011 },
  CNY: { locale: 'zh-CN', minimumFractionDigits: 0, maximumFractionDigits: 2, usdRate: 0.138 },
  JPY: { locale: 'ja-JP', minimumFractionDigits: 0, maximumFractionDigits: 0, usdRate: 0.0066 },
  AUD: { locale: 'en-AU', minimumFractionDigits: 0, maximumFractionDigits: 2, usdRate: 0.64 }
};

const CURRENCY_ORDER = ['USD', 'EUR', 'GBP', 'RUB', 'CNY', 'JPY', 'AUD'];

const REGION_PRICING_CONFIG = {
  america: { currency: 'USD', affordability: 1, nameKey: 'admin.regionAmerica' },
  europe: { currency: 'EUR', affordability: 0.96, nameKey: 'admin.regionEurope' },
  eurasia: { currency: 'RUB', affordability: 0.78, nameKey: 'admin.regionEurasia' },
  asia: { currency: 'CNY', affordability: 0.84, nameKey: 'admin.regionAsia' },
  oceania: { currency: 'AUD', affordability: 1.03, nameKey: 'admin.regionOceania' }
};

const REGION_ORDER = ['america', 'europe', 'eurasia', 'asia', 'oceania'];

const getBrowserLocale = () => {
  const locale = Array.isArray(navigator.languages) && navigator.languages.length ? navigator.languages[0] : navigator.language;
  return String(locale || 'en-US').trim() || 'en-US';
};

const detectLanguageFromLocale = (locale = getBrowserLocale()) => (String(locale).toLowerCase().startsWith('ru') ? 'ru' : 'en');

const detectPricingRegionFromLocale = (locale = getBrowserLocale()) => {
  const normalized = String(locale || '').trim();
  const [, regionRaw = 'US'] = normalized.split(/[-_]/);
  const region = regionRaw.toUpperCase();
  if (['RU', 'BY', 'KZ', 'KG', 'AM', 'AZ', 'TJ', 'TM', 'UZ', 'MD'].includes(region)) return 'eurasia';
  if (['DE', 'FR', 'IT', 'ES', 'PT', 'NL', 'BE', 'AT', 'IE', 'FI', 'GR', 'SK', 'SI', 'LV', 'LT', 'EE', 'LU', 'PL', 'CZ', 'SE', 'NO', 'DK', 'CH', 'RO', 'BG', 'HR', 'HU', 'GB'].includes(region)) return 'europe';
  if (['CN', 'JP', 'KR', 'IN', 'SG', 'HK', 'TW', 'TH', 'MY', 'VN', 'ID', 'PH'].includes(region)) return 'asia';
  if (['AU', 'NZ'].includes(region)) return 'oceania';
  if (['US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE'].includes(region)) return 'america';
  return 'america';
};

const detectCurrencyFromLocale = (locale = getBrowserLocale()) => {
  const region = detectPricingRegionFromLocale(locale);
  return REGION_PRICING_CONFIG[region]?.currency || 'USD';
};

const convertMoney = (value, fromCurrency = 'RUB', toCurrency = currentCurrency) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const sourceCode = CURRENCY_CONFIG[fromCurrency] ? fromCurrency : 'USD';
  const targetCode = CURRENCY_CONFIG[toCurrency] ? toCurrency : 'USD';
  const sourceUsdRate = CURRENCY_CONFIG[sourceCode].usdRate || 1;
  const targetUsdRate = CURRENCY_CONFIG[targetCode].usdRate || 1;
  const usdValue = safeValue * sourceUsdRate;
  return usdValue / targetUsdRate;
};

const formatMoneyValue = (value, currency = currentCurrency) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const code = CURRENCY_CONFIG[currency] ? currency : 'USD';
  const config = CURRENCY_CONFIG[code];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: config.minimumFractionDigits,
    maximumFractionDigits: config.maximumFractionDigits
  }).format(safeValue);
};

const formatPrice = (value, currency = currentCurrency, sourceCurrency = 'RUB') => formatMoneyValue(convertMoney(value, sourceCurrency, currency), currency);

const parseTextList = (value) =>
  (Array.isArray(value) ? value : String(value || '').split(/[\r\n,;]+/))
    .map((item) => String(item || '').trim())
    .filter(Boolean);

const normalizePricingRegion = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  return REGION_PRICING_CONFIG[raw] ? raw : 'eurasia';
};

const parseRegionalPrices = (value) => {
  if (!value) return {};
  const source =
    typeof value === 'string'
      ? (() => {
          try {
            return JSON.parse(value);
          } catch {
            return {};
          }
        })()
      : value;
  const next = {};
  REGION_ORDER.forEach((region) => {
    const n = Number(source?.[region]);
    if (Number.isFinite(n) && n > 0) next[region] = n;
  });
  return next;
};

const convertRegionalBasePrice = (amount, fromRegion, toRegion) => {
  const safeAmount = Number(amount);
  if (!Number.isFinite(safeAmount) || safeAmount <= 0) return 0;
  const sourceRegion = REGION_PRICING_CONFIG[normalizePricingRegion(fromRegion)];
  const targetRegion = REGION_PRICING_CONFIG[normalizePricingRegion(toRegion)];
  const sourceUsdRate = CURRENCY_CONFIG[sourceRegion.currency]?.usdRate || 1;
  const targetUsdRate = CURRENCY_CONFIG[targetRegion.currency]?.usdRate || 1;
  const normalizedUsd = (safeAmount * sourceUsdRate) / (sourceRegion.affordability || 1);
  const targetAmount = (normalizedUsd * (targetRegion.affordability || 1)) / targetUsdRate;
  return Math.max(0, Number(targetAmount.toFixed(targetRegion.currency === 'RUB' || targetRegion.currency === 'JPY' ? 0 : 2)));
};

const getMarketPriceInfo = (product, region = currentPricingRegion) => {
  const safeRegion = normalizePricingRegion(region);
  const regionalPrices = parseRegionalPrices(product?.regional_prices);
  const directPrice = Number(regionalPrices[safeRegion]);
  if (Number.isFinite(directPrice) && directPrice > 0) {
    return {
      amount: directPrice,
      currency: REGION_PRICING_CONFIG[safeRegion].currency,
      region: safeRegion,
      isRegional: true
    };
  }
  const baseRegion = normalizePricingRegion(product?.base_pricing_region || 'eurasia');
  const baseAmount = Number(product?.price) || 0;
  const amount = safeRegion === baseRegion ? baseAmount : convertRegionalBasePrice(baseAmount, baseRegion, safeRegion);
  return {
    amount,
    currency: REGION_PRICING_CONFIG[safeRegion].currency,
    region: safeRegion,
    isRegional: false
  };
};

const getDisplayPriceInfo = (product, { region = currentPricingRegion, displayCurrency = currentCurrency } = {}) => {
  const market = getMarketPriceInfo(product, region);
  const displayAmount = convertMoney(market.amount, market.currency, displayCurrency);
  return {
    ...market,
    displayAmount,
    displayCurrency
  };
};

const formatProductPrice = (product, options = {}) => {
  const pricing = getDisplayPriceInfo(product, options);
  return formatMoneyValue(pricing.displayAmount, pricing.displayCurrency);
};

const formatStoredMoney = (amount, currency = currentCurrency) => formatMoneyValue(Number(amount) || 0, CURRENCY_CONFIG[currency] ? currency : currentCurrency);

const resolveCartItemPricing = (item, product = null) => {
  if (product) {
    const pricing = getDisplayPriceInfo(product);
    return {
      price: pricing.displayAmount,
      price_currency: pricing.displayCurrency,
      pricing_region: pricing.region,
      regional_prices: parseRegionalPrices(product.regional_prices),
      base_pricing_region: normalizePricingRegion(product.base_pricing_region || 'eurasia')
    };
  }
  const sourceCurrency = CURRENCY_CONFIG[String(item?.price_currency || '').toUpperCase()]
    ? String(item.price_currency).toUpperCase()
    : currentCurrency;
  const displayAmount = sourceCurrency === currentCurrency ? Number(item?.price) || 0 : convertMoney(Number(item?.price) || 0, sourceCurrency, currentCurrency);
  return {
    price: displayAmount,
    price_currency: currentCurrency,
    pricing_region: normalizePricingRegion(item?.pricing_region || currentPricingRegion),
    regional_prices: parseRegionalPrices(item?.regional_prices),
    base_pricing_region: normalizePricingRegion(item?.base_pricing_region || 'eurasia')
  };
};
const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
const safeUrl = (value, { allowDataImage = true, allowBlob = true } = {}) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (allowDataImage && /^data:image\//i.test(raw)) return raw;
  if (allowBlob && /^blob:/i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^(\/|\.\/|\.\.\/)/.test(raw)) return raw;
  return '';
};
const renderTextParagraphs = (...parts) =>
  parts
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .map((part) => `<p>${escapeHtml(part)}</p>`)
    .join('');
const normalizeId = (id) => (id === undefined || id === null ? '' : String(id));
const idsEqual = (a, b) => normalizeId(a) === normalizeId(b);
const parseQty = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const isOutOfStock = (product) => parseQty(product?.quantity) <= 0;
const displayQty = (qty) => {
  const n = parseQty(qty);
  return Number.isFinite(n) ? n : t('common.dash');
};

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(currentLanguage === 'ru' ? 'ru-RU' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const normalizeCartItem = (item) => ({
  id: normalizeId(item.id),
  name: item.name || t('common.product'),
  price: Number(item.price) || 0,
  price_currency: CURRENCY_CONFIG[String(item.price_currency || '').toUpperCase()] ? String(item.price_currency).toUpperCase() : currentCurrency,
  pricing_region: normalizePricingRegion(item.pricing_region || currentPricingRegion),
  quantity: Math.max(1, parseQty(item.quantity ?? item.qty ?? 1)),
  image_url: item.image_url || item.image || '',
  category: item.category || t('common.general'),
  desc: item.desc || '',
  country: item.country || '',
  size: item.size || '',
  tags: Array.isArray(item.tags) ? item.tags : [],
  regional_prices: parseRegionalPrices(item.regional_prices),
  base_pricing_region: normalizePricingRegion(item.base_pricing_region || 'eurasia'),
  stock_quantity: parseQty(item.stock_quantity ?? item.product_quantity ?? item.quantity_available ?? item.quantity ?? item.qty ?? 0)
});

const readLocalCart = () => {
  const stored = localStorage.getItem(CART_KEY);
  try {
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeCartItem) : [];
  } catch {
    return [];
  }
};

const writeLocalCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart.map(normalizeCartItem)));

const getLocalCartSource = () => localStorage.getItem(CART_SOURCE_KEY) || 'guest';

const setLocalCartSource = (value) => {
  if (!value) {
    localStorage.removeItem(CART_SOURCE_KEY);
    return;
  }
  localStorage.setItem(CART_SOURCE_KEY, value);
};

const setCartCache = (cart, { persistLocal = true, source } = {}) => {
  const normalized = (Array.isArray(cart) ? cart : []).map(normalizeCartItem);
  cartCache = normalized;
  if (persistLocal) {
    writeLocalCart(normalized);
    if (source !== undefined) setLocalCartSource(source);
  }
  return normalized;
};

const getCart = () => {
  if (Array.isArray(cartCache)) return cartCache.map(normalizeCartItem);
  return setCartCache(readLocalCart(), { persistLocal: false });
};

const cartsEqual = (left = [], right = []) => JSON.stringify(left.map(normalizeCartItem)) === JSON.stringify(right.map(normalizeCartItem));

const mergeCartSources = (remoteCart = [], localCart = []) => {
  const merged = new Map();
  remoteCart.map(normalizeCartItem).forEach((item) => {
    merged.set(item.id, item);
  });
  localCart.map(normalizeCartItem).forEach((item) => {
    const existing = merged.get(item.id);
    if (!existing) {
      merged.set(item.id, item);
      return;
    }
    merged.set(item.id, {
      ...existing,
      quantity: Math.max(existing.quantity, item.quantity),
      image_url: existing.image_url || item.image_url,
      category: existing.category || item.category,
      desc: existing.desc || item.desc,
      country: existing.country || item.country,
      size: existing.size || item.size,
      tags: Array.isArray(existing.tags) && existing.tags.length ? existing.tags : item.tags,
      stock_quantity: Math.max(parseQty(existing.stock_quantity), parseQty(item.stock_quantity))
    });
  });
  return Array.from(merged.values()).map(normalizeCartItem);
};

const maybeDisableRemoteCartSync = (error) => {
  const message = String(error?.message || '').toLowerCase();
  if (!message) return;
  if (message.includes('user_carts') && (message.includes('does not exist') || message.includes('relation') || message.includes('schema cache') || message.includes('could not find'))) {
    cartRemoteAvailable = false;
  }
};

const syncCartToRemote = async (cart = getCart()) => {
  const user = getCurrentUserState();
  if (!cartRemoteAvailable || !user || !window.db?.upsertCartDb) return cart.map(normalizeCartItem);
  const normalized = cart.map(normalizeCartItem);
  try {
    await window.db.upsertCartDb(normalized);
    setLocalCartSource(`user:${user.id}`);
    cartHydratedUserId = user.id;
  } catch (error) {
    maybeDisableRemoteCartSync(error);
    console.error('Cart sync failed', error);
  }
  return normalized;
};

const scheduleCartSync = () => {
  clearTimeout(cartSyncTimer);
  const user = getCurrentUserState();
  if (!cartRemoteAvailable || !user || !window.db?.upsertCartDb) return;
  cartSyncTimer = setTimeout(() => {
    syncCartToRemote().catch((error) => {
      console.error('Deferred cart sync failed', error);
    });
  }, 220);
};

const syncCartFromRemote = async ({ force = false } = {}) => {
  const user = getCurrentUserState();
  if (!cartRemoteAvailable || !user || !window.db?.fetchCartDb) {
    cartHydratedUserId = null;
    const fallback = setCartCache(readLocalCart(), { persistLocal: false });
    updateCartCount();
    return fallback;
  }
  if (!force && cartHydratedUserId === user.id && Array.isArray(cartCache)) {
    return getCart();
  }
  if (cartSyncPromise) return cartSyncPromise;
  cartSyncPromise = (async () => {
    const localCart = readLocalCart();
    const localSource = getLocalCartSource();
    const userSource = `user:${user.id}`;
    try {
      const remoteCart = await window.db.fetchCartDb();
      const remoteNormalized = (Array.isArray(remoteCart) ? remoteCart : []).map(normalizeCartItem);
      const shouldMergeGuestCart = localSource === 'guest' && localCart.length > 0;
      const nextCart = shouldMergeGuestCart ? mergeCartSources(remoteNormalized, localCart) : remoteNormalized;
      setCartCache(nextCart, { source: userSource });
      cartHydratedUserId = user.id;
      if (shouldMergeGuestCart && !cartsEqual(remoteNormalized, nextCart)) {
        await window.db.upsertCartDb(nextCart);
      }
      updateCartCount();
      return nextCart;
    } catch (error) {
      maybeDisableRemoteCartSync(error);
      console.error('Cart hydrate failed', error);
      const fallback = setCartCache(localCart, { source: localSource });
      cartHydratedUserId = user.id;
      updateCartCount();
      return fallback;
    } finally {
      cartSyncPromise = null;
    }
  })();
  return cartSyncPromise;
};

const saveCart = (cart, { sync = true } = {}) => {
  const user = getCurrentUserState();
  const normalized = setCartCache(cart, { source: user ? `user:${user.id}` : 'guest' });
  if (sync) scheduleCartSync();
  return normalized;
};

const clearCart = async () => {
  setCartCache([]);
  updateCartCount();
  await syncCartToRemote([]);
};

const syncCartImmediately = (cart = getCart()) => {
  clearTimeout(cartSyncTimer);
  return syncCartToRemote(cart).catch((error) => {
    console.error('Immediate cart sync failed', error);
  });
};

const normalizeFavoriteIds = (items = []) =>
  Array.from(
    new Set(
      (Array.isArray(items) ? items : [])
        .map((id) => normalizeId(id))
        .filter(Boolean)
    )
  );

const readLocalFavorites = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    return normalizeFavoriteIds(parsed);
  } catch {
    return [];
  }
};

const writeLocalFavorites = (items = []) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(normalizeFavoriteIds(items)));
};

const getLocalFavoritesSource = () => localStorage.getItem(FAVORITES_SOURCE_KEY) || 'guest';

const setLocalFavoritesSource = (value) => {
  if (!value) {
    localStorage.removeItem(FAVORITES_SOURCE_KEY);
    return;
  }
  localStorage.setItem(FAVORITES_SOURCE_KEY, value);
};

const setFavoritesCache = (items = [], { persistLocal = true, source } = {}) => {
  favoritesCache = normalizeFavoriteIds(items);
  if (persistLocal) {
    writeLocalFavorites(favoritesCache);
    if (source !== undefined) setLocalFavoritesSource(source);
  }
  return [...favoritesCache];
};

const getFavorites = () => {
  if (Array.isArray(favoritesCache) && favoritesCache.length) return [...favoritesCache];
  const local = readLocalFavorites();
  return setFavoritesCache(local, { persistLocal: false });
};

const isFavorite = (productId) => getFavorites().some((id) => idsEqual(id, productId));

const updateWishlistCount = () => {
  const count = getFavorites().length;
  document.querySelectorAll('#wishlist-count').forEach((el) => {
    el.textContent = count ? String(count) : '';
    el.classList.toggle('hidden', !count);
  });
};

const refreshFavoriteControls = (productId = null) => {
  const favorites = getFavorites();
  const selector = productId
    ? `.favorite-toggle[data-id="${normalizeId(productId)}"], .wishlist-action-btn[data-id="${normalizeId(productId)}"]`
    : '.favorite-toggle[data-id], .wishlist-action-btn[data-id]';
  document.querySelectorAll(selector).forEach((btn) => {
    const active = favorites.some((id) => idsEqual(id, btn.dataset.id));
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    btn.setAttribute('aria-label', active ? t('product.removeFromWishlist') : t('product.addToWishlist'));
    btn.setAttribute('title', active ? t('product.removeFromWishlist') : t('product.addToWishlist'));
    const text = btn.querySelector('[data-favorite-label]');
    if (text) text.textContent = active ? t('product.removeFromWishlist') : t('product.addToWishlist');
    const path = btn.querySelector('svg path');
    if (path) {
      path.setAttribute('fill', active ? 'currentColor' : 'none');
    }
  });
  updateWishlistCount();
};

const syncFavoritesFromRemote = async ({ force = false } = {}) => {
  const user = getCurrentUserState();
  if (!user || !window.db?.fetchFavoritesDb) {
    const local = readLocalFavorites();
    setFavoritesCache(local, { persistLocal: false });
    updateWishlistCount();
    return local;
  }
  if (!force && favoritesSyncPromise) return favoritesSyncPromise;
  favoritesSyncPromise = (async () => {
    const localFavorites = readLocalFavorites();
    const localSource = getLocalFavoritesSource();
    const userSource = `user:${user.id}`;
    try {
      const remoteFavorites = normalizeFavoriteIds(await window.db.fetchFavoritesDb());
      const shouldMergeGuest = localSource === 'guest' && localFavorites.length > 0;
      const merged = shouldMergeGuest ? normalizeFavoriteIds([...remoteFavorites, ...localFavorites]) : remoteFavorites;
      if (shouldMergeGuest) {
        const missing = merged.filter((id) => !remoteFavorites.some((remoteId) => idsEqual(remoteId, id)));
        for (const id of missing) {
          await window.db.addFavoriteDb(id);
        }
      }
      setFavoritesCache(merged, { source: userSource });
      updateWishlistCount();
      return merged;
    } catch (error) {
      console.error('Favorites sync failed', error);
      const fallback = setFavoritesCache(localFavorites, { source: localSource });
      updateWishlistCount();
      return fallback;
    } finally {
      favoritesSyncPromise = null;
    }
  })();
  return favoritesSyncPromise;
};

const toggleFavorite = async (productId, { silent = false } = {}) => {
  const id = normalizeId(productId);
  if (!id) return false;
  const user = getCurrentUserState();
  const nextActive = !isFavorite(id);
  const nextFavorites = nextActive ? normalizeFavoriteIds([...getFavorites(), id]) : getFavorites().filter((favId) => !idsEqual(favId, id));
  setFavoritesCache(nextFavorites, { source: user ? `user:${user.id}` : 'guest' });
  refreshFavoriteControls(id);
  if (user) {
    try {
      if (nextActive) await window.db?.addFavoriteDb?.(id);
      else await window.db?.removeFavoriteDb?.(id);
    } catch (error) {
      console.error('Favorite update failed', error);
      const rollback = nextActive ? getFavorites().filter((favId) => !idsEqual(favId, id)) : normalizeFavoriteIds([...getFavorites(), id]);
      setFavoritesCache(rollback, { source: `user:${user.id}` });
      refreshFavoriteControls(id);
      throw error;
    }
  }
  if (!silent) {
    showToast(nextActive ? t('wishlist.added') : t('wishlist.removed'));
  }
  if (document.body.dataset.page === 'wishlist') {
    renderWishlistPage();
  }
  return nextActive;
};

const stopCartRealtime = async () => {
  if (!cartRealtimeSubscription || !window.db?.offCartChangeDb) {
    cartRealtimeSubscription = null;
    return;
  }
  try {
    await window.db.offCartChangeDb(cartRealtimeSubscription);
  } catch (error) {
    console.error('Cart realtime unsubscribe failed', error);
  } finally {
    cartRealtimeSubscription = null;
  }
};

const handleRemoteCartItems = async (items = []) => {
  const user = getCurrentUserState();
  const source = user ? `user:${user.id}` : 'guest';
  setCartCache(Array.isArray(items) ? items : [], { source });
  cartHydratedUserId = user?.id || null;
  updateCartCount();
  if (document.body.dataset.page === 'cart') {
    await renderCartPage();
    renderRecommended();
  } else if (document.body.dataset.page === 'checkout') {
    await renderCheckout();
  }
};

const startCartRealtime = async () => {
  const user = getCurrentUserState();
  if (!cartRemoteAvailable || !user || !window.db?.onCartChangeDb) {
    await stopCartRealtime();
    return;
  }
  await stopCartRealtime();
  try {
    cartRealtimeSubscription = window.db.onCartChangeDb(user.id, async (payload) => {
      const nextItems = Array.isArray(payload?.new?.items)
        ? payload.new.items
        : Array.isArray(payload?.items)
        ? payload.items
        : null;
      if (nextItems) {
        await handleRemoteCartItems(nextItems);
        return;
      }
      const refreshed = await syncCartFromRemote({ force: true });
      await handleRemoteCartItems(refreshed);
    });
  } catch (error) {
    console.error('Cart realtime subscribe failed', error);
  }
};

const cartCount = (cart) => cart.reduce((sum, item) => sum + item.quantity, 0);

const normalizeSpecs = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item) => {
      const name = String(item?.name || '').trim();
      const value = String(item?.value || '').trim();
      if (!name || !value) return null;
      return { name, value };
    })
    .filter(Boolean);

const loadProductSpecsMap = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(PRODUCT_SPECS_KEY) || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
};

const saveProductSpecsMap = (map) => localStorage.setItem(PRODUCT_SPECS_KEY, JSON.stringify(map));

const getStoredProductSpecs = (productId) => {
  const map = loadProductSpecsMap();
  return normalizeSpecs(map[normalizeId(productId)] || []);
};

const setStoredProductSpecs = (productId, specs) => {
  const id = normalizeId(productId);
  if (!id) return;
  const map = loadProductSpecsMap();
  const normalized = normalizeSpecs(specs);
  if (normalized.length) map[id] = normalized;
  else delete map[id];
  saveProductSpecsMap(map);
};

const getProductSpecs = (product) => {
  const byId = getStoredProductSpecs(product?.id);
  if (byId.length) return byId;
  if (!product?.features) return [];

  if (Array.isArray(product.features)) return normalizeSpecs(product.features);
  const raw = String(product.features).trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return normalizeSpecs(parsed);
  } catch {
    // keep plain text fallback below
  }

  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s*[:\-–]\s*/);
      if (parts.length < 2) return null;
      const name = parts.shift()?.trim() || '';
      const value = parts.join(':').trim();
      if (!name || !value) return null;
      return { name, value };
    })
    .filter(Boolean);
};

const getCurrentUserState = () => currentUser;
const getCurrentUserRoleState = () => currentUserRole;

const setCurrentUser = (user) => {
  const prevUserId = currentUser?.id || null;
  currentUser = user
    ? {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata || {}
      }
    : null;
  const nextUserId = currentUser?.id || null;
  if (!nextUserId) {
    currentUserRole = null;
  } else if (prevUserId && prevUserId !== nextUserId) {
    currentUserRole = null;
  }
  updateNavUser();
};

const setCurrentUserRole = (role) => {
  const normalized = typeof role === 'string' ? role.trim().toLowerCase() : null;
  if (normalized) {
    currentUserRole = normalized;
  } else {
    currentUserRole = getCurrentUserState() ? 'user' : null;
  }
  updateNavUser();
  return currentUserRole;
};

async function getCurrentUser() {
  try {
    if (!window.db?.getAuthUser) {
      setCurrentUser(null);
      return null;
    }
    const user = await window.db.getAuthUser();
    setCurrentUser(user);
    return getCurrentUserState();
  } catch (error) {
    console.error('Auth user fetch failed', error);
    setCurrentUser(null);
    return null;
  }
}

async function getUserRole() {
  try {
    if (!window.db?.getUserRoleDb) {
      return setCurrentUserRole(getCurrentUserState() ? 'user' : null);
    }
    const role = await window.db.getUserRoleDb();
    return setCurrentUserRole(role || (getCurrentUserState() ? 'user' : null));
  } catch (error) {
    console.error('User role fetch failed', error);
    return setCurrentUserRole(getCurrentUserState() ? 'user' : null);
  }
}

const initAuth = async () => {
  await getCurrentUser();
  await getUserRole();
  await syncCartFromRemote({ force: true });
  await syncFavoritesFromRemote({ force: true });
  await startCartRealtime();
  if (!cartFocusListenerBound) {
    cartFocusListenerBound = true;
    window.addEventListener('focus', () => {
      syncCartFromRemote({ force: true }).catch((error) => {
        console.error('Cart refresh on focus failed', error);
      });
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      syncCartFromRemote({ force: true }).catch((error) => {
        console.error('Cart refresh on visibility change failed', error);
      });
    });
    window.addEventListener('pageshow', () => {
      syncCartFromRemote({ force: true }).catch((error) => {
        console.error('Cart refresh on pageshow failed', error);
      });
    });
  }
  if (window.db?.onAuthChange && !authSubscription) {
    const result = window.db.onAuthChange((_event, session) => {
      (async () => {
        setCurrentUser(session?.user || null);
        if (session?.user) {
          await getUserRole();
          await syncCartFromRemote({ force: true });
          await syncFavoritesFromRemote({ force: true });
          await startCartRealtime();
        } else {
          setCurrentUserRole(null);
          await stopCartRealtime();
          cartHydratedUserId = null;
          setCartCache(readLocalCart(), { persistLocal: false });
          setFavoritesCache(readLocalFavorites(), { persistLocal: false });
          updateCartCount();
          updateWishlistCount();
        }
      })().catch((error) => {
        console.error('Auth state change failed', error);
      });
    });
    authSubscription = result?.data?.subscription || true;
  }
};

const loadProducts = async () => {
  productLoadError = '';
  try {
    if (window.db?.fetchProductsDb) {
      const remote = await window.db.fetchProductsDb();
      const normalized = (remote || []).map((p) => ({ ...p, id: normalizeId(p.id) }));
      products = normalized;
      return normalized;
    }
  } catch (e) {
    console.error('Supabase load failed', e);
    productLoadError = e?.message || 'Products temporarily unavailable. Please try again.';
  }
  products = [];
  return [];
};

const normalizeOrderStatus = (status) => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase();
  if (normalized === 'paid') return 'processing';
  return ORDER_STATUS_OPTIONS.includes(normalized) ? normalized : 'pending';
};

const ORDER_TIMELINE_STEPS = ['pending', 'processing', 'shipped', 'pickup', 'delivered'];

const COLOR_SWATCH_MAP = {
  red: '#ef4444',
  crimson: '#dc2626',
  blue: '#2563eb',
  navy: '#1e3a8a',
  sky: '#38bdf8',
  cyan: '#06b6d4',
  teal: '#14b8a6',
  green: '#22c55e',
  lime: '#84cc16',
  yellow: '#eab308',
  orange: '#f97316',
  purple: '#8b5cf6',
  violet: '#7c3aed',
  pink: '#ec4899',
  white: '#f8fafc',
  black: '#111827',
  gray: '#9ca3af',
  grey: '#9ca3af',
  silver: '#cbd5e1',
  gold: '#f59e0b',
  brown: '#92400e',
  beige: '#d6c4a7',
  cream: '#f5f1e8',
  transparent: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(148,163,184,0.25))',
  красный: '#ef4444',
  синий: '#2563eb',
  голубой: '#38bdf8',
  бирюзовый: '#14b8a6',
  зеленый: '#22c55e',
  зелёный: '#22c55e',
  желтый: '#eab308',
  жёлтый: '#eab308',
  оранжевый: '#f97316',
  фиолетовый: '#8b5cf6',
  розовый: '#ec4899',
  белый: '#f8fafc',
  черный: '#111827',
  чёрный: '#111827',
  серый: '#9ca3af',
  серебристый: '#cbd5e1',
  золотой: '#f59e0b',
  коричневый: '#92400e',
  бежевый: '#d6c4a7',
  кремовый: '#f5f1e8',
  прозрачный: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(148,163,184,0.25))'
};

const parseProductColors = (value) => {
  const raw = Array.isArray(value) ? value : String(value || '').split(/[,;/]/);
  return raw
    .map((item) => String(item || '').trim())
    .filter(Boolean);
};

const normalizeSafetyList = (value) => parseTextList(value);

const buildSafetyBadgeMarkup = (product) => {
  const ageRating = String(product?.age_rating || '').trim();
  if (!ageRating) return '';
  return `<span class="product-age-badge">${escapeHtml(ageRating)}</span>`;
};

const buildSafetyEntries = (product) => {
  const ageRating = String(product?.age_rating || '').trim();
  const materials = normalizeSafetyList(product?.materials);
  const certifications = normalizeSafetyList(product?.certifications);
  const safetyWarnings = String(product?.safety_warnings || '').trim();
  return [
    ageRating ? { label: t('product.ageRating'), value: ageRating } : null,
    materials.length ? { label: t('product.materials'), value: materials.join(', ') } : null,
    certifications.length ? { label: t('product.certifications'), value: certifications.join(', ') } : null,
    safetyWarnings ? { label: t('product.safetyWarnings'), value: safetyWarnings } : null
  ].filter(Boolean);
};

const buildProductDetailEntries = (product) =>
  [
    product?.country ? { label: t('product.country'), value: product.country } : null,
    product?.size ? { label: t('product.size'), value: product.size } : null,
    product?.color ? { label: t('product.color'), value: parseProductColors(product.color).join(', ') } : null,
    product?.category ? { label: t('admin.category'), value: product.category } : null,
    product?.features ? { label: t('product.features'), value: product.features } : null
  ].filter(Boolean);

const renderInfoCards = (entries = []) =>
  entries
    .map(
      (entry) => `
        <article class="safety-card">
          <span class="muted tiny">${escapeHtml(entry.label)}</span>
          <p>${escapeHtml(entry.value)}</p>
        </article>
      `
    )
    .join('');

const parseGalleryInput = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  const raw = String(value || '').trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item || '').trim()).filter(Boolean);
  } catch {}
  if (raw.includes('data:image')) {
    return raw
      .split(/\r?\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return raw
    .split(/[\r\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const resolveColorSwatch = (label) => {
  const normalized = String(label || '').trim().toLowerCase();
  if (!normalized) return { label: '', background: 'var(--surface-2)', dark: false };
  const mapped = COLOR_SWATCH_MAP[normalized];
  const background =
    mapped ||
    (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized) ? normalized : /^rgb|^hsl/i.test(normalized) ? normalized : 'var(--surface-2)');
  const darkBackground = ['#111827', '#1e3a8a', '#7c3aed', '#8b5cf6', '#92400e', '#2563eb', '#dc2626'].includes(
    String(background).toLowerCase()
  );
  return { label: String(label || '').trim(), background, dark: darkBackground };
};

const loadOrders = async (filters = {}) => {
  try {
    if (!window.db?.fetchOrdersDb) return [];
    const data = await window.db.fetchOrdersDb(filters);
    orders = data.map((order) => ({ ...order, status: normalizeOrderStatus(order.status) }));
    return orders;
  } catch (error) {
    console.error('Failed to load orders', error);
    return [];
  }
};

const normalizeSupportStatus = (status) => (status === 'answered' ? 'answered' : 'new');

const normalizeSupportMessage = (item = {}) => ({
  id: normalizeId(item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
  source: item.source === 'product_question' ? 'product_question' : 'support',
  user_email: String(item.user_email || '').trim().toLowerCase(),
  user_name: String(item.user_name || '').trim(),
  product_id: normalizeId(item.product_id || ''),
  product_name: String(item.product_name || '').trim(),
  message: String(item.message || '').trim(),
  answer: String(item.answer || '').trim(),
  status: normalizeSupportStatus(item.status),
  created_at: item.created_at || new Date().toISOString(),
  answered_at: item.answered_at || ''
});

const loadSupportMessagesLocal = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SUPPORT_MESSAGES_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.map(normalizeSupportMessage) : [];
  } catch {
    return [];
  }
};

const saveSupportMessagesLocal = (items = []) => {
  localStorage.setItem(SUPPORT_MESSAGES_KEY, JSON.stringify(items.map(normalizeSupportMessage)));
};

const sortSupportMessages = (items = []) =>
  [...items].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

const loadSupportMessages = async () => {
  try {
    if (window.db?.fetchSupportMessagesDb) {
      const data = await window.db.fetchSupportMessagesDb();
      supportMessages = sortSupportMessages(data.map(normalizeSupportMessage));
      return supportMessages;
    }
  } catch (error) {
    console.error('Failed to load support messages from Supabase', error);
  }
  supportMessages = sortSupportMessages(loadSupportMessagesLocal());
  return supportMessages;
};

const createSupportMessage = async (payload = {}) => {
  const base = normalizeSupportMessage(payload);
  try {
    if (window.db?.insertSupportMessageDb) {
      const data = await window.db.insertSupportMessageDb(base);
      const saved = normalizeSupportMessage((data && data[0]) || base);
      supportMessages = sortSupportMessages([saved, ...supportMessages.filter((m) => !idsEqual(m.id, saved.id))]);
      return saved;
    }
  } catch (error) {
    console.error('Failed to create support message in Supabase', error);
  }
  const local = sortSupportMessages([base, ...loadSupportMessagesLocal().filter((m) => !idsEqual(m.id, base.id))]);
  saveSupportMessagesLocal(local);
  supportMessages = local;
  return base;
};

const answerSupportMessage = async (id, answer, status = 'answered') => {
  const messageId = normalizeId(id);
  const patch = {
    answer: String(answer || '').trim(),
    status: normalizeSupportStatus(status),
    answered_at: new Date().toISOString()
  };
  try {
    if (window.db?.updateSupportMessageDb) {
      const data = await window.db.updateSupportMessageDb(messageId, patch);
      const updated = normalizeSupportMessage((data && data[0]) || { id: messageId, ...patch });
      supportMessages = sortSupportMessages(supportMessages.map((m) => (idsEqual(m.id, messageId) ? { ...m, ...updated } : m)));
      return updated;
    }
  } catch (error) {
    console.error('Failed to answer support message in Supabase', error);
  }
  const local = loadSupportMessagesLocal().map((m) => (idsEqual(m.id, messageId) ? { ...m, ...patch } : m));
  saveSupportMessagesLocal(local);
  supportMessages = sortSupportMessages(local);
  return supportMessages.find((m) => idsEqual(m.id, messageId)) || null;
};

const THEME_ICONS = {
  dark: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7.2 7.2 0 0 0 9.8 9.8Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `,
  light: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.8"></circle>
      <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
    </svg>
  `
};

const updateCartCount = () => {
  const badge = document.getElementById('cart-count');
  if (!badge) return;
  const count = cartCount(getCart());
  badge.textContent = count;
};

const getStoredLanguage = () => {
  const saved = String(localStorage.getItem(LANGUAGE_KEY) || '').trim().toLowerCase();
  if (saved === 'ru' || saved === 'en') return saved;
  return detectLanguageFromLocale();
};

const updateLanguageToggle = () => {
  const toggle = document.getElementById('lang-toggle');
  if (!toggle) return;
  toggle.innerHTML = `
    <span class="${currentLanguage === 'en' ? 'active' : ''}">EN</span>
    <span class="lang-separator">/</span>
    <span class="${currentLanguage === 'ru' ? 'active' : ''}">RU</span>
  `;
  toggle.setAttribute('aria-label', t('nav.switchLanguage'));
};

const getStoredCurrency = () => {
  const saved = String(localStorage.getItem(CURRENCY_KEY) || '').trim().toUpperCase();
  if (CURRENCY_CONFIG[saved]) return saved;
  return detectCurrencyFromLocale();
};

const createCurrencySelectMarkup = () => `
  <button class="select-toggle" type="button" aria-expanded="false" aria-label="${escapeHtml(t('nav.switchCurrency'))}">
    ${escapeHtml(currentCurrency)} <span class="select-arrow">▼</span>
  </button>
  <ul class="select-options" role="listbox">
    ${CURRENCY_ORDER.map(
      (code) => `
        <li tabindex="0" role="option" data-value="${code}" aria-selected="${code === currentCurrency ? 'true' : 'false'}">
          <span>${code}</span>
        </li>
      `
    ).join('')}
  </ul>
`;

const updateCurrencyToggle = () => {
  const select = document.getElementById('currency-toggle');
  if (!select) return;
  const toggle = select.querySelector('.select-toggle');
  const optionsWrap = select.querySelector('.select-options');
  if (toggle) {
    toggle.setAttribute('aria-label', t('nav.switchCurrency'));
    toggle.setAttribute('title', `${t('nav.switchCurrency')}: ${currentCurrency}`);
    if (toggle.firstChild && toggle.firstChild.nodeType === Node.TEXT_NODE) {
      toggle.firstChild.textContent = `${currentCurrency} `;
    } else {
      toggle.prepend(document.createTextNode(`${currentCurrency} `));
    }
  }
  optionsWrap?.querySelectorAll('li').forEach((opt) => {
    opt.setAttribute('aria-selected', opt.dataset.value === currentCurrency ? 'true' : 'false');
  });
};

const setupCurrencySelect = () => {
  const select = document.getElementById('currency-toggle');
  if (!select) return;
  const toggle = select.querySelector('.select-toggle');
  const optionsWrap = select.querySelector('.select-options');
  if (!toggle || !optionsWrap) return;

  const close = () => {
    select.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  const open = () => {
    select.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  };

  if (toggle.dataset.bound !== '1') {
    toggle.dataset.bound = '1';
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = select.classList.contains('open');
      isOpen ? close() : open();
    });
  }

  optionsWrap.querySelectorAll('li').forEach((opt) => {
    if (opt.dataset.bound === '1') return;
    opt.dataset.bound = '1';
    opt.addEventListener('click', () => {
      const next = opt.dataset.value || 'USD';
      if (!CURRENCY_CONFIG[next]) return;
      localStorage.setItem(CURRENCY_KEY, next);
      close();
      window.location.reload();
    });
    opt.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        opt.click();
      }
    });
  });

  if (select.dataset.outsideBound !== '1') {
    select.dataset.outsideBound = '1';
    document.addEventListener('click', (e) => {
      if (!select.contains(e.target)) close();
    });
  }
};

const translateDom = () => {
  document.documentElement.lang = currentLanguage;
  const page = document.body?.dataset?.page || 'home';
  document.title = t(`title.${page}`);

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel));
  });

  const paymentToggle = document.getElementById('payment-toggle');
  if (paymentToggle?.firstChild) {
    paymentToggle.firstChild.textContent = ` ${t('checkout.selectPayment')} `;
  }

  updateCurrencyToggle();
};

const initLanguage = () => {
  currentLanguage = getStoredLanguage();
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle && !document.getElementById('lang-toggle')) {
    const langToggle = document.createElement('button');
    langToggle.id = 'lang-toggle';
    langToggle.type = 'button';
    langToggle.className = 'lang-toggle';
    themeToggle.parentNode.insertBefore(langToggle, themeToggle);
    langToggle.addEventListener('click', () => {
      const next = currentLanguage === 'ru' ? 'en' : 'ru';
      localStorage.setItem(LANGUAGE_KEY, next);
      window.location.reload();
    });
  }
  updateLanguageToggle();
  translateDom();
};

const initCurrency = () => {
  currentPricingRegion = detectPricingRegionFromLocale();
  currentCurrency = getStoredCurrency();
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle && !document.getElementById('currency-toggle')) {
    const currencyToggle = document.createElement('div');
    currencyToggle.id = 'currency-toggle';
    currencyToggle.className = 'custom-select nav-currency-select';
    currencyToggle.innerHTML = createCurrencySelectMarkup();
    themeToggle.parentNode.insertBefore(currencyToggle, themeToggle);
  }
  setupCurrencySelect();
  updateCurrencyToggle();
};

const setupNavSettings = () => {
  const nav = document.querySelector('.nav-links');
  const themeToggle = document.getElementById('theme-toggle');
  const langToggle = document.getElementById('lang-toggle');
  const currencyToggle = document.getElementById('currency-toggle');
  if (!nav || !themeToggle || !langToggle || !currencyToggle || document.getElementById('nav-settings')) return;

  const settings = document.createElement('div');
  settings.id = 'nav-settings';
  settings.className = 'nav-settings';
  settings.innerHTML = `
    <button class="nav-settings-toggle" type="button" aria-expanded="false" aria-label="Settings">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" fill="none" stroke="currentColor" stroke-width="1.7"/>
        <path d="M19 12a7.7 7.7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7.8 7.8 0 0 0-1.8-1L14.4 3h-4.8l-.3 3.1a7.8 7.8 0 0 0-1.8 1l-2.4-1-2 3.4 2 1.5a7.7 7.7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7.8 7.8 0 0 0 1.8 1l.3 3.1h4.8l.3-3.1a7.8 7.8 0 0 0 1.8-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
      </svg>
    </button>
    <div class="nav-settings-panel"></div>
  `;
  nav.insertBefore(settings, document.getElementById('nav-wishlist') || themeToggle.nextSibling);
  const panel = settings.querySelector('.nav-settings-panel');
  panel.appendChild(langToggle);
  panel.appendChild(currencyToggle);
  panel.appendChild(themeToggle);

  const toggle = settings.querySelector('.nav-settings-toggle');
  const close = () => {
    settings.classList.remove('open');
    nav.classList.remove('settings-open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = settings.classList.contains('open');
    if (isOpen) {
      close();
    } else {
      settings.classList.add('open');
      nav.classList.add('settings-open');
    }
    toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  });
  document.addEventListener('click', (e) => {
    if (!settings.contains(e.target)) close();
  });
};

const orderStatusLabel = (status) => {
  const normalized = normalizeOrderStatus(status);
  return t(`orderStatus.${normalized}`);
};

const updateNavUser = () => {
  const user = getCurrentUserState();
  const role = getCurrentUserRoleState();
  const navUser = document.getElementById('nav-user');
  const logoutBtn = document.getElementById('logout');
  const navLogin = document.getElementById('nav-login');
  const navRegister = document.getElementById('nav-register');
  const navProfile = document.getElementById('nav-profile');
  const navAdmin = document.getElementById('nav-admin');
  const navWishlist = document.getElementById('nav-wishlist');
  if (navUser) navUser.textContent = user ? user.user_metadata?.full_name || user.email : '';
  if (logoutBtn) {
    logoutBtn.classList.toggle('hidden', !user);
    logoutBtn.onclick = async () => {
      try {
        if (window.db?.signOutAuth) {
          await window.db.signOutAuth();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCurrentUser(null);
        window.location.href = 'index.html';
      }
    };
  }
  if (navLogin) navLogin.classList.toggle('hidden', !!user);
  if (navRegister) navRegister.classList.toggle('hidden', !!user);
  if (navProfile) navProfile.classList.toggle('hidden', !user);
  if (navAdmin) navAdmin.classList.toggle('hidden', !(user && role === 'admin'));
  if (navWishlist) navWishlist.classList.remove('hidden');
  updateWishlistCount();
};

const showToast = (message) => {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
};

const getCartIconElement = () => document.querySelector('.cart-link[href="cart.html"]');

const getFlyToCartImageSource = (triggerEl, product) => {
  if (triggerEl instanceof HTMLElement) {
    const scopedImage =
      triggerEl.closest('.collection-card')?.querySelector('.collection-card-media img') ||
      triggerEl.closest('.card')?.querySelector('.card-media img') ||
      triggerEl.closest('.modal-card')?.querySelector('img') ||
      triggerEl.closest('.product-layout')?.querySelector('#product-main') ||
      triggerEl.closest('.checkout-item')?.querySelector('img');
    if (scopedImage instanceof HTMLImageElement) return scopedImage;
  }

  if (document.body.dataset.page === 'product') {
    const mainImage = document.getElementById('product-main');
    if (mainImage instanceof HTMLImageElement) return mainImage;
  }

  const productImage = product?.image || product?.image_url || '';
  if (!productImage) return null;
  const phantom = new Image();
  phantom.src = productImage;
  return phantom;
};

const animateAddToCart = (triggerEl, product) => {
  const cartIcon = getCartIconElement();
  if (!cartIcon) return;

  const sourceImage = getFlyToCartImageSource(triggerEl, product);
  if (!(sourceImage instanceof HTMLImageElement) || !sourceImage.src) return;

  const sourceRect = sourceImage.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();
  if (!sourceRect.width || !sourceRect.height || !cartRect.width || !cartRect.height) return;

  const flyer = document.createElement('img');
  flyer.className = 'cart-flyer';
  flyer.src = sourceImage.currentSrc || sourceImage.src;
  flyer.alt = '';
  flyer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(flyer);

  const startX = sourceRect.left + sourceRect.width / 2;
  const startY = sourceRect.top + sourceRect.height / 2;
  const endX = cartRect.left + cartRect.width / 2;
  const endY = cartRect.top + cartRect.height / 2;

  flyer.style.left = `${startX}px`;
  flyer.style.top = `${startY}px`;
  flyer.style.width = `${Math.max(48, Math.min(sourceRect.width, 150))}px`;
  flyer.style.height = `${Math.max(48, Math.min(sourceRect.height, 150))}px`;
  flyer.style.setProperty('--fly-x', `${endX - startX}px`);
  flyer.style.setProperty('--fly-y', `${endY - startY}px`);

  requestAnimationFrame(() => {
    flyer.classList.add('flying');
    cartIcon.classList.add('cart-bump');
  });

  const cleanup = () => {
    flyer.remove();
    cartIcon.classList.remove('cart-bump');
  };

  flyer.addEventListener('animationend', cleanup, { once: true });
  setTimeout(cleanup, 900);
};

const supportSourceLabel = (source) => (source === 'product_question' ? t('admin.sourceProduct') : t('admin.sourceSupport'));

const openSupportModal = async ({ source = 'support', product = null } = {}) => {
  document.querySelectorAll('.modal-backdrop.support-backdrop').forEach((node) => node.remove());
  const user = getCurrentUserState() || (await getCurrentUser());
  const productId = normalizeId(product?.id || '');
  const productName = product?.name || '';
  const titleKey = source === 'product_question' ? 'support.askProductTitle' : 'support.title';
  const contextHtml =
    source === 'product_question' && productName
      ? `<p class="support-context"><strong>${t('support.product')}:</strong> ${productName}</p>`
      : '';

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop support-backdrop';
  backdrop.innerHTML = `
    <div class="modal-card support-modal">
      <h3>${t(titleKey)}</h3>
      <p class="muted small">${t('support.subtitle')}</p>
      ${contextHtml}
      <form id="support-form" class="support-form">
        <div class="form-row">
          <label for="support-name">${t('support.name')}</label>
          <input id="support-name" type="text" value="${(user?.user_metadata?.full_name || '').replace(/"/g, '&quot;')}">
        </div>
        <div class="form-row">
          <label for="support-email">${t('support.email')}</label>
          <input id="support-email" type="email" required value="${(user?.email || '').replace(/"/g, '&quot;')}">
        </div>
        <div class="form-row">
          <label for="support-message">${t('support.message')}</label>
          <textarea id="support-message" rows="5" required placeholder="${t('support.messagePlaceholder')}"></textarea>
        </div>
        <p id="support-error" class="muted small hidden"></p>
        <div class="support-form-actions">
          <button id="support-cancel" type="button" class="btn ghost">${t('support.cancel')}</button>
          <button id="support-submit" type="submit" class="btn primary">${t('support.send')}</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(backdrop);
  requestAnimationFrame(() => backdrop.classList.add('show'));

  const closeModal = () => {
    backdrop.classList.remove('show');
    setTimeout(() => backdrop.remove(), 160);
  };

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });
  backdrop.querySelector('#support-cancel')?.addEventListener('click', closeModal);

  const form = backdrop.querySelector('#support-form');
  const submitBtn = backdrop.querySelector('#support-submit');
  const errEl = backdrop.querySelector('#support-error');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = (backdrop.querySelector('#support-name')?.value || '').trim();
    const email = (backdrop.querySelector('#support-email')?.value || '').trim().toLowerCase();
    const message = (backdrop.querySelector('#support-message')?.value || '').trim();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      if (errEl) {
        errEl.textContent = t('auth.validEmail');
        errEl.classList.remove('hidden');
      }
      return;
    }
    if (!message) {
      if (errEl) {
        errEl.textContent = t('support.error');
        errEl.classList.remove('hidden');
      }
      return;
    }
    if (errEl) errEl.classList.add('hidden');

    const originalText = submitBtn?.textContent || '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = t('support.sending');
    }
    try {
      await createSupportMessage({
        source,
        user_email: email,
        user_name: name,
        product_id: productId,
        product_name: productName,
        message,
        status: 'new'
      });
      showToast(t('support.success'));
      closeModal();
    } catch (error) {
      console.error(error);
      if (errEl) {
        errEl.textContent = t('support.error');
        errEl.classList.remove('hidden');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText || t('support.send');
      }
    }
  });
};

const wireSupportLinks = () => {
  document.querySelectorAll('[data-i18n="footer.support"]').forEach((link) => {
    if (link.dataset.supportBound === '1') return;
    link.dataset.supportBound = '1';
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openSupportModal({ source: 'support' });
    });
  });
};

const ensureProducts = async (ids = []) => {
  if (!ids.length) return;
  const missingIds = Array.from(
    new Set(ids.map((id) => normalizeId(id)).filter((id) => !products.find((p) => idsEqual(p.id, id))))
  );
  if (!missingIds.length) return;
  try {
    if (window.db?.fetchProductsByIdsDb) {
      const remote = await window.db.fetchProductsByIdsDb(missingIds);
      const normalized = (remote || []).map((p) => ({ ...p, id: normalizeId(p.id) }));
      normalized.forEach((item) => {
        const existingIndex = products.findIndex((p) => idsEqual(p.id, item.id));
        if (existingIndex >= 0) products[existingIndex] = item;
        else products.push(item);
      });
      return;
    }
  } catch (error) {
    console.error('Partial product fetch failed', error);
  }
  products = await loadProducts();
};

const bootstrapProductsForPage = async () => {
  const page = document.body.dataset.page || '';
  if (page === 'home' || page === 'products' || page === 'admin') {
    products = await loadProducts();
  }
};

const addToCart = async (productIdRaw, options = {}) => {
  const productId = normalizeId(productIdRaw);
  let product = products.find((p) => idsEqual(p.id, productId));
  if (!product) {
    await ensureProducts([productId]);
    product = products.find((p) => idsEqual(p.id, productId));
  }

  // Build a safe snapshot in case product isn't found later
  const snapshot = product || {
    id: productId,
    name: t('common.product'),
    price: 0,
    regional_prices: {},
    base_pricing_region: 'eurasia',
    image: '',
    category: t('common.general'),
    desc: '',
    country: '',
    size: '',
    tags: [],
    quantity: 0
  };

  if (isOutOfStock(snapshot)) {
    showToast(t('common.unavailable'));
    return;
  }

  const cart = getCart();
  const existing = cart.find((item) => idsEqual(item.id, productId));
  const availableQty = Number(snapshot.quantity || product?.quantity || 0);
  if (availableQty && existing && existing.quantity >= availableQty) {
    showToast(t('common.limitReached'));
    return;
  }
  const pricing = getDisplayPriceInfo(snapshot);
  if (existing) {
    existing.quantity += 1;
    existing.price = pricing.displayAmount;
    existing.price_currency = pricing.displayCurrency;
    existing.pricing_region = pricing.region;
    existing.regional_prices = parseRegionalPrices(snapshot.regional_prices);
    existing.base_pricing_region = normalizePricingRegion(snapshot.base_pricing_region || 'eurasia');
  } else {
    cart.push({
      id: productId,
      quantity: 1,
      name: snapshot.name,
      price: pricing.displayAmount,
      price_currency: pricing.displayCurrency,
      pricing_region: pricing.region,
      regional_prices: parseRegionalPrices(snapshot.regional_prices),
      base_pricing_region: normalizePricingRegion(snapshot.base_pricing_region || 'eurasia'),
      image_url: snapshot.image,
      category: snapshot.category,
      desc: snapshot.desc,
      country: snapshot.country,
      size: snapshot.size,
      tags: snapshot.tags,
      stock_quantity: snapshot.quantity
    });
  }
  saveCart(cart);
  syncCartImmediately(cart);
  updateCartCount();
  animateAddToCart(options?.triggerEl, snapshot);
  if (document.body.dataset.page === 'cart') {
    await renderCartPage();
    renderRecommended();
  }
  showToast(t('common.addedToCart', { name: snapshot.name }));
};

const attachCardImageScrub = (imageEl, product) => {
  if (!imageEl || !product) return;

  const gallery = Array.from(
    new Set([product.image, ...(Array.isArray(product.gallery_images) ? product.gallery_images : [])].filter(Boolean))
  );

  if (gallery.length <= 1) return;

  let index = 0;
  let frameId = 0;
  imageEl.classList.add('has-gallery');
  gallery.slice(1).forEach((src) => {
    const preload = new Image();
    preload.src = src;
  });

  const showImage = (nextIndex) => {
    const safeIndex = Math.min(gallery.length - 1, Math.max(0, nextIndex));
    if (safeIndex === index) return;
    index = safeIndex;
    imageEl.src = gallery[index];
  };

  imageEl.addEventListener('mousemove', (e) => {
    const rect = imageEl.getBoundingClientRect();
    if (!rect.width) return;
    const relativeX = Math.min(Math.max(e.clientX - rect.left, 0), rect.width - 1);
    const ratio = relativeX / rect.width;
    const nextIndex = Math.min(gallery.length - 1, Math.floor(ratio * gallery.length));
    if (frameId) cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(() => {
      showImage(nextIndex);
      frameId = 0;
    });
  });

  imageEl.addEventListener('mouseleave', () => {
    if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
    index = 0;
    imageEl.src = gallery[0];
  });
};

const createFavoriteButtonMarkup = (productId) => {
  const active = isFavorite(productId);
  return `
    <button
      class="favorite-toggle ${active ? 'active' : ''}"
      type="button"
      data-id="${productId}"
      aria-pressed="${active ? 'true' : 'false'}"
      aria-label="${active ? t('product.removeFromWishlist') : t('product.addToWishlist')}"
      title="${active ? t('product.removeFromWishlist') : t('product.addToWishlist')}"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20.2 4.9 13.4a4.8 4.8 0 0 1 6.8-6.8L12 7l.3-.4a4.8 4.8 0 0 1 6.8 6.8Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="sr-only" data-favorite-label>${active ? t('product.removeFromWishlist') : t('product.addToWishlist')}</span>
    </button>
  `;
};

const createCard = (product) => {
  const card = document.createElement('article');
  card.className = 'card';
  const soldOut = isOutOfStock(product);
  const productName = escapeHtml(product.name);
  const productImage = safeUrl(product.image);
  const pricing = getDisplayPriceInfo(product);
  if (soldOut) card.classList.add('sold-out');
  card.tabIndex = 0;
  card.setAttribute('role', 'link');
  card.setAttribute('aria-label', product.name);
  const safeRating = Number.isFinite(Number(product.rating)) ? Number(product.rating) : 0;
  const safeReviews = Number.isFinite(Number(product.reviews_count)) ? Number(product.reviews_count) : 0;
  card.innerHTML = `
    <div class="card-media">
      ${createFavoriteButtonMarkup(product.id)}
      ${buildSafetyBadgeMarkup(product)}
      <img src="${productImage}" alt="${productName}">
    </div>
    <h3>${productName}</h3>
    <div class="card-rating" aria-label="${safeRating.toFixed(1)} rating">
      <span class="card-rating-star" aria-hidden="true">★</span>
      <span class="card-rating-value">${safeRating.toFixed(1)}</span>
      <span class="card-rating-sep" aria-hidden="true">·</span>
      <span class="card-rating-count">${safeReviews} ${t('product.reviews')}</span>
    </div>
    <div class="card-commerce-row">
      <span class="price">${formatMoneyValue(pricing.displayAmount, pricing.displayCurrency)}</span>
      <span class="stock-mini ${soldOut ? 'is-out' : 'is-in'}">${soldOut ? t('product.outOfStock') : t('product.inStock')}</span>
    </div>
    <div class="card-actions">
      <button class="btn primary add-to-cart" data-id="${product.id}" ${soldOut ? 'disabled' : ''}>${soldOut ? t('product.outOfStock') : t('product.addToCart')}</button>
    </div>
  `;

  const cardImage = card.querySelector('img');
  attachCardImageScrub(cardImage, product);

  const openProductPage = () => {
    window.location.href = `product.html?id=${product.id}`;
  };

  card.addEventListener('click', (e) => {
    if (e.target.closest('.add-to-cart, .favorite-toggle')) return;
    openProductPage();
  });

  card.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (e.target.closest('.add-to-cart, .favorite-toggle')) return;
    e.preventDefault();
    openProductPage();
  });

  return card;
};

const createCollectionCard = (product) => {
  const card = document.createElement('article');
  card.className = 'collection-card';
  const soldOut = isOutOfStock(product);
  const hasSale = Number(product.old_price) > Number(product.price);
  const pricing = getDisplayPriceInfo(product);
  const safeRating = Number.isFinite(Number(product.rating)) ? Number(product.rating) : 0;
  const safeReviews = Number.isFinite(Number(product.reviews_count)) ? Number(product.reviews_count) : 0;
  const productName = escapeHtml(product.name);
  const productImage = safeUrl(product.image);
  if (soldOut) card.classList.add('sold-out');
  card.tabIndex = 0;
  card.setAttribute('role', 'link');
  card.setAttribute('aria-label', product.name);
  card.innerHTML = `
    <div class="collection-card-media">
      ${createFavoriteButtonMarkup(product.id)}
      ${buildSafetyBadgeMarkup(product)}
      ${hasSale ? `<span class="collection-card-badge sale">${t('products.saleBadge')}</span>` : ''}
      ${soldOut ? `<span class="collection-card-badge stock">${t('product.outOfStock')}</span>` : ''}
      <img src="${productImage}" alt="${productName}">
    </div>
    <div class="collection-card-body">
      <p class="collection-card-vendor">Dragon Toys</p>
      <h3>${productName}</h3>
      <div class="collection-card-meta">
        <span class="collection-card-rating">★ ${safeRating.toFixed(1)}</span>
        <span class="collection-card-reviews">${safeReviews} ${t('product.reviews')}</span>
      </div>
      <div class="collection-card-price">
        <span class="price">${formatMoneyValue(pricing.displayAmount, pricing.displayCurrency)}</span>
        <span class="stock-mini ${soldOut ? 'is-out' : 'is-in'}">${soldOut ? t('product.outOfStock') : t('product.inStock')}</span>
        ${hasSale ? `<span class="price-old">${formatPrice(product.old_price)}</span>` : ''}
      </div>
      <div class="collection-card-actions">
        <button class="btn primary small-btn add-to-cart" data-id="${product.id}" type="button" ${soldOut ? 'disabled' : ''}>${soldOut ? t('product.outOfStock') : t('product.addToCart')}</button>
      </div>
    </div>
  `;

  attachCardImageScrub(card.querySelector('.collection-card-media img'), product);

  const openProductPage = () => {
    window.location.href = `product.html?id=${product.id}`;
  };

  card.addEventListener('click', (e) => {
    if (e.target.closest('.add-to-cart, .favorite-toggle')) return;
    openProductPage();
  });

  card.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (e.target.closest('.add-to-cart, .favorite-toggle')) return;
    e.preventDefault();
    openProductPage();
  });

  return card;
};

const productMeta = (product) => ({
  country: product.country || t('common.notSpecified'),
  delivery: product.delivery || t('common.notSpecified'),
  size: product.size || ''
});

const openProductModal = (product) => {
  const meta = productMeta(product);
  const soldOut = isOutOfStock(product);
  const pricing = getDisplayPriceInfo(product);
  // remove any existing modal to avoid overlay blocks
  document.querySelectorAll('.modal-backdrop').forEach((n) => n.remove());

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  document.body.appendChild(backdrop);
  backdrop.innerHTML = `
    <div class="modal-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="modal-row">
        <h3>${product.name}</h3>
        <div class="price">${formatMoneyValue(pricing.displayAmount, pricing.displayCurrency)}</div>
      </div>
      ${product.desc ? `<p class="muted">${product.desc}</p>` : ''}
      ${(product.tags || []).length ? `<div class="tag-row">${product.tags.map((t) => `<span class="pill">${t}</span>`).join('')}</div>` : ''}
      <div class="modal-meta">
        <span>${t('product.country')}: ${meta.country}</span>
        <span>${t('product.size')}: ${meta.size || t('common.dash')}</span>
        <span>${t('common.delivery')}: ${meta.delivery}</span>
      </div>
      <div class="modal-actions">
        <button class="btn ghost" id="modal-view-close">${t('common.close')}</button>
        <button class="btn primary add-to-cart" data-id="${product.id}" ${soldOut ? 'disabled' : ''}>${soldOut ? t('product.outOfStock') : t('product.addToCart')}</button>
      </div>
    </div>
  `;
  backdrop.classList.add('show');

  const close = () => {
    backdrop.classList.remove('show');
    setTimeout(() => backdrop.remove(), 150);
  };

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
  document.getElementById('modal-view-close')?.addEventListener('click', close);
};

const sampleProducts = (count) => {
  const copy = [...products];
  const result = [];
  const target = Math.min(count, copy.length);
  while (result.length < target) {
    const index = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(index, 1)[0]);
  }
  return result;
};

const mountProductCarousel = ({ items, track, dotsWrap, left, right }) => {
  if (!track || !dotsWrap || !left || !right) return;
  if (typeof track.__carouselCleanup === 'function') {
    track.__carouselCleanup();
    track.__carouselCleanup = null;
  }
  if (!items.length) {
    track.innerHTML = '';
    dotsWrap.innerHTML = '';
    left.classList.add('hidden');
    right.classList.add('hidden');
    return;
  }

  track.innerHTML = '';
  items.forEach((item) => {
    const card = createCard(item);
    card.classList.add('carousel-card');
    track.appendChild(card);
  });

  const windowEl = track.parentElement;
  let itemsPerView = 4;
  let pageIndex = 0;
  let timer;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchDeltaX = 0;
  let touchDeltaY = 0;
  let touchTracking = false;
  let suppressClickUntil = 0;

  const totalSlides = () => Math.max(1, Math.ceil(items.length / itemsPerView));
  const getCards = () => Array.from(track.querySelectorAll('.carousel-card'));
  const getTrackGap = () => {
    const styles = window.getComputedStyle(track);
    return Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
  };
  const getMaxOffset = () => {
    const viewportWidth = windowEl?.clientWidth || 0;
    return Math.max(0, track.scrollWidth - viewportWidth);
  };
  const getPageOffset = (page = pageIndex) => {
    const cards = getCards();
    if (!cards.length) return 0;
    const targetIndex = Math.min(page * itemsPerView, cards.length - 1);
    const targetCard = cards[targetIndex];
    return Math.min(targetCard?.offsetLeft || 0, getMaxOffset());
  };
  const setTrackOffset = (offset) => {
    track.style.transform = `translateX(-${Math.max(0, offset)}px)`;
  };

  const updatePosition = () => {
    setTrackOffset(getPageOffset());
    dotsWrap.querySelectorAll('button').forEach((dot, i) => {
      dot.classList.toggle('active', i === pageIndex);
    });
  };

  const clampPage = () => {
    const slides = totalSlides();
    if (pageIndex >= slides) pageIndex = 0;
    if (pageIndex < 0) pageIndex = slides - 1;
  };

  const next = () => {
    pageIndex += 1;
    clampPage();
    updatePosition();
  };

  const prev = () => {
    pageIndex -= 1;
    clampPage();
    updatePosition();
  };

  const buildDots = () => {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalSlides(); i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      if (i === pageIndex) dot.classList.add('active');
      dot.addEventListener('click', () => {
        pageIndex = i;
        resetTimer();
        updatePosition();
      });
      dotsWrap.appendChild(dot);
    }
  };

  const toggleControls = () => {
    const hasMultipleSlides = totalSlides() > 1;
    left.classList.toggle('hidden', !hasMultipleSlides);
    right.classList.toggle('hidden', !hasMultipleSlides);
    dotsWrap.classList.toggle('hidden', !hasMultipleSlides);
  };

  const computeItemsPerView = () => {
    const w = windowEl?.clientWidth || window.innerWidth;
    const gap = getTrackGap();
    if (!w) {
      requestAnimationFrame(computeItemsPerView);
      return;
    }
    if (w >= 1440) itemsPerView = 5;
    else if (w >= 1120) itemsPerView = 4;
    else if (w >= 780) itemsPerView = 3;
    else if (w >= 320) itemsPerView = 2;
    else itemsPerView = 1;

    const cardWidth = Math.max(0, (w - (itemsPerView - 1) * gap) / itemsPerView);
    getCards().forEach((card) => {
      card.style.flex = `0 0 ${cardWidth}px`;
      card.style.width = `${cardWidth}px`;
      card.style.maxWidth = `${cardWidth}px`;
    });
    buildDots();
    clampPage();
    toggleControls();
    updatePosition();
  };

  const resetTimer = () => {
    clearTimeout(timer);
    if (totalSlides() <= 1) return;
    timer = setTimeout(() => {
      next();
      resetTimer();
    }, 12000);
  };

  right.onclick = () => {
    next();
    resetTimer();
  };
  left.onclick = () => {
    prev();
    resetTimer();
  };

  const handleResize = () => {
    computeItemsPerView();
  };

  const handleTouchStart = (event) => {
    if (totalSlides() <= 1) return;
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchDeltaX = 0;
    touchDeltaY = 0;
    touchTracking = true;
    clearTimeout(timer);
  };

  const handleTouchMove = (event) => {
    if (!touchTracking) return;
    const touch = event.touches?.[0];
    if (!touch) return;
    touchDeltaX = touch.clientX - touchStartX;
    touchDeltaY = touch.clientY - touchStartY;
    if (Math.abs(touchDeltaY) > Math.abs(touchDeltaX) && Math.abs(touchDeltaY) > 10) {
      touchTracking = false;
      resetTimer();
      return;
    }
    if (Math.abs(touchDeltaX) > 12 && Math.abs(touchDeltaX) > Math.abs(touchDeltaY)) {
      event.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (!touchTracking) return;
    touchTracking = false;
    const absX = Math.abs(touchDeltaX);
    const absY = Math.abs(touchDeltaY);
    if (absX > 42 && absX > absY) {
      suppressClickUntil = Date.now() + 350;
      if (touchDeltaX < 0) next();
      else prev();
    } else {
      updatePosition();
    }
    resetTimer();
  };

  const handleTouchCancel = () => {
    touchTracking = false;
    updatePosition();
    resetTimer();
  };

  const handleTrackClickCapture = (event) => {
    if (Date.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  windowEl?.addEventListener('touchstart', handleTouchStart, { passive: true });
  windowEl?.addEventListener('touchmove', handleTouchMove, { passive: false });
  windowEl?.addEventListener('touchend', handleTouchEnd, { passive: true });
  windowEl?.addEventListener('touchcancel', handleTouchCancel, { passive: true });
  track.addEventListener('click', handleTrackClickCapture, true);
  window.addEventListener('resize', handleResize);
  track.querySelectorAll('img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', handleResize, { once: true });
  });

  computeItemsPerView();
  resetTimer();

  track.__carouselCleanup = () => {
    clearTimeout(timer);
    window.removeEventListener('resize', handleResize);
    windowEl?.removeEventListener('touchstart', handleTouchStart);
    windowEl?.removeEventListener('touchmove', handleTouchMove);
    windowEl?.removeEventListener('touchend', handleTouchEnd);
    windowEl?.removeEventListener('touchcancel', handleTouchCancel);
    track.removeEventListener('click', handleTrackClickCapture, true);
    track.querySelectorAll('img').forEach((img) => img.removeEventListener('load', handleResize));
  };
};

const renderPopular = () => {
  const track = document.getElementById('popular-track');
  const dotsWrap = document.getElementById('carousel-dots');
  const left = document.querySelector('.carousel-arrow.left');
  const right = document.querySelector('.carousel-arrow.right');
  if (!track || !dotsWrap || !left || !right) return;
  const featured = [...products]
    .sort((a, b) => {
      const reviewDelta = (Number(b.reviews_count) || 0) - (Number(a.reviews_count) || 0);
      if (reviewDelta) return reviewDelta;
      return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    })
    .slice(0, 12);
  mountProductCarousel({ items: featured.length ? featured : products, track, dotsWrap, left, right });
};

const renderRelatedProducts = (currentId) => {
  if (document.body.dataset.page !== 'product') return;
  const section = document.getElementById('related-products-section');
  const track = document.getElementById('related-track');
  const dotsWrap = document.getElementById('related-dots');
  const left = document.getElementById('related-left');
  const right = document.getElementById('related-right');
  if (!section || !track || !dotsWrap || !left || !right) return;

  const related = products.filter((p) => !idsEqual(p.id, currentId));
  if (!related.length) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  mountProductCarousel({ items: related, track, dotsWrap, left, right });
};

const renderProductSpecsSection = (product) => {
  if (document.body.dataset.page !== 'product') return;
  const section = document.getElementById('product-specs-section');
  const grid = document.getElementById('product-specs-grid');
  const scrollBtn = document.getElementById('specs-scroll-btn');
  const detailsGrid = document.getElementById('product-tab-details');
  const detailTabs = document.getElementById('product-detail-tabs');
  const detailsTabButton = document.querySelector('[data-product-tab="details"]');
  if (!section || !grid || !scrollBtn) return;

  const specs = getProductSpecs(product);
  if (!specs.length) {
    section.classList.add('hidden');
    scrollBtn.classList.add('hidden');
    return;
  }

  const customSpecsMarkup = specs.map((spec) => `
    <article class="safety-card product-spec-card">
      <span>${escapeHtml(spec.name)}</span>
      <strong>${escapeHtml(spec.value)}</strong>
    </article>
  `).join('');

  if (detailsGrid) {
    detailsGrid.insertAdjacentHTML('beforeend', customSpecsMarkup);
    section.classList.add('hidden');
  } else {
    grid.innerHTML = customSpecsMarkup;
    section.classList.remove('hidden');
  }

  scrollBtn.classList.remove('hidden');
  scrollBtn.onclick = () => {
    detailsTabButton?.click();
    (detailTabs || section).scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
};

const setupProductDetailTabs = () => {
  if (document.body.dataset.page !== 'product') return;
  const tabs = Array.from(document.querySelectorAll('[data-product-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-product-tab-panel]'));
  if (!tabs.length || !panels.length) return;
  const setTab = (tabName = 'description') => {
    tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.productTab === tabName));
    panels.forEach((panel) => panel.classList.toggle('active', panel.dataset.productTabPanel === tabName));
  };
  tabs.forEach((tab) => {
    if (tab.dataset.bound === '1') return;
    tab.dataset.bound = '1';
    tab.addEventListener('click', () => setTab(tab.dataset.productTab || 'description'));
  });
  const reviewsSection = document.getElementById('product-reviews-section');
  const reviewsSlot = document.getElementById('product-reviews-slot');
  if (reviewsSection && reviewsSlot && !reviewsSlot.contains(reviewsSection)) {
    reviewsSlot.appendChild(reviewsSection);
  }
  setTab('description');
};

const setupAdminProductFormTabs = () => {
  if (document.body.dataset.page !== 'admin') return;
  const tabs = Array.from(document.querySelectorAll('[data-product-form-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-product-form-panel]'));
  if (!tabs.length || !panels.length) return;
  const setTab = (tabName = 'basic') => {
    tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.productFormTab === tabName));
    panels.forEach((panel) => panel.classList.toggle('active', panel.dataset.productFormPanel === tabName));
  };
  tabs.forEach((tab) => {
    if (tab.dataset.bound === '1') return;
    tab.dataset.bound = '1';
    tab.addEventListener('click', () => setTab(tab.dataset.productFormTab || 'basic'));
  });
  setTab('basic');
};

const state = {
  filtered: [],
  currentPage: 1,
  pageSize: 12,
  searchTerm: '',
  sortBy: 'featured',
  filtersOpen: true,
  viewMode: localStorage.getItem(COLLECTION_VIEW_KEY) === 'list' ? 'list' : 'grid',
  activeFilters: {
    availability: ['in', 'out'],
    minPrice: '',
    maxPrice: '',
    category: 'all',
    tags: []
  }
};

const getCollectionProducts = () => {
  const term = state.searchTerm.toLowerCase().trim();
  const availability = state.activeFilters.availability;
  const minPrice = Number(state.activeFilters.minPrice);
  const maxPrice = Number(state.activeFilters.maxPrice);
  const activeTags = state.activeFilters.tags.map((tag) => tag.toLowerCase());
  const category = state.activeFilters.category;

  const filtered = products.filter((product) => {
    const productTags = Array.isArray(product.tags) ? product.tags.map((tag) => tag.toLowerCase()) : [];
    const price = getDisplayPriceInfo(product).displayAmount;
    const inStock = !isOutOfStock(product);
    const matchesAvailability =
      availability.length === 0 ||
      (availability.includes('in') && inStock) ||
      (availability.includes('out') && !inStock);
    const matchesPrice =
      (!Number.isFinite(minPrice) || !state.activeFilters.minPrice || price >= minPrice) &&
      (!Number.isFinite(maxPrice) || !state.activeFilters.maxPrice || price <= maxPrice);
    const matchesCategory = category === 'all' || product.category === category;
    const matchesTags = !activeTags.length || activeTags.some((tag) => productTags.includes(tag));
    const matchesTerm =
      !term ||
      product.name.toLowerCase().includes(term) ||
      (product.desc || '').toLowerCase().includes(term) ||
      productTags.some((tag) => tag.includes(term));

    return matchesAvailability && matchesPrice && matchesCategory && matchesTags && matchesTerm;
  });

  const featuredIndex = (product) => products.findIndex((item) => idsEqual(item.id, product.id));
  const productTimestamp = (product) => {
    const time = new Date(product.created_at || 0).getTime();
    return Number.isFinite(time) ? time : 0;
  };

  filtered.sort((a, b) => {
    switch (state.sortBy) {
      case 'best-selling':
        return (Number(b.reviews_count) || 0) - (Number(a.reviews_count) || 0) || (Number(b.rating) || 0) - (Number(a.rating) || 0);
      case 'alpha-asc':
        return a.name.localeCompare(b.name, currentLanguage === 'ru' ? 'ru' : 'en');
      case 'alpha-desc':
        return b.name.localeCompare(a.name, currentLanguage === 'ru' ? 'ru' : 'en');
      case 'price-asc':
        return getDisplayPriceInfo(a).displayAmount - getDisplayPriceInfo(b).displayAmount;
      case 'price-desc':
        return getDisplayPriceInfo(b).displayAmount - getDisplayPriceInfo(a).displayAmount;
      case 'newest':
        return productTimestamp(b) - productTimestamp(a);
      case 'oldest':
        return productTimestamp(a) - productTimestamp(b);
      case 'featured':
      default:
        return featuredIndex(a) - featuredIndex(b);
    }
  });

  return filtered;
};

const renderCollectionFilterOptions = () => {
  const categoriesWrap = document.getElementById('filter-categories');
  const tagsWrap = document.getElementById('filter-tags');
  if (!categoriesWrap || !tagsWrap) return;

  categoriesWrap.innerHTML = '';
  const categoryChoices = ['all', ...Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort((a, b) => a.localeCompare(b))];
  categoryChoices.forEach((category) => {
    const label = document.createElement('label');
    label.className = 'filter-choice';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'filter-category';
    input.value = category;
    input.checked = state.activeFilters.category === category;
    const span = document.createElement('span');
    span.textContent = category === 'all' ? t('products.allCategories') : category;
    label.appendChild(input);
    label.appendChild(span);
    categoriesWrap.appendChild(label);
  });

  tagsWrap.innerHTML = '';
  Array.from(new Set(products.flatMap((product) => (Array.isArray(product.tags) ? product.tags : [])).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b))
    .forEach((tag) => {
      const label = document.createElement('label');
      label.className = 'filter-choice filter-choice-tag';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'filter-tag';
      input.value = tag.toLowerCase();
      input.checked = state.activeFilters.tags.includes(tag.toLowerCase());
      const span = document.createElement('span');
      span.textContent = tag;
      label.appendChild(input);
      label.appendChild(span);
      tagsWrap.appendChild(label);
    });
};

const syncCollectionFilterForm = () => {
  const form = document.getElementById('collection-filters-form');
  if (!form) return;
  const availabilityInputs = Array.from(form.querySelectorAll('input[name="availability"]'));
  availabilityInputs.forEach((input) => {
    input.checked = state.activeFilters.availability.includes(input.value);
  });
  const minInput = document.getElementById('min-price');
  const maxInput = document.getElementById('max-price');
  if (minInput) minInput.value = state.activeFilters.minPrice;
  if (maxInput) maxInput.value = state.activeFilters.maxPrice;
  renderCollectionFilterOptions();
};

const readCollectionFiltersFromForm = () => {
  const form = document.getElementById('collection-filters-form');
  if (!form) return;
  state.activeFilters.availability = Array.from(form.querySelectorAll('input[name="availability"]:checked')).map((input) => input.value);
  state.activeFilters.minPrice = document.getElementById('min-price')?.value.trim() || '';
  state.activeFilters.maxPrice = document.getElementById('max-price')?.value.trim() || '';
  state.activeFilters.category = form.querySelector('input[name="filter-category"]:checked')?.value || 'all';
  state.activeFilters.tags = Array.from(form.querySelectorAll('input[name="filter-tag"]:checked')).map((input) => input.value);
};

const getCollectionTitle = () => (state.activeFilters.category !== 'all' ? state.activeFilters.category : t('products.title'));

const renderCollectionMeta = () => {
  const title = getCollectionTitle();
  const total = state.filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
  if (state.currentPage > totalPages) state.currentPage = totalPages;
  const from = total ? (state.currentPage - 1) * state.pageSize + 1 : 0;
  const to = total ? Math.min(total, state.currentPage * state.pageSize) : 0;
  const countLabel = t('products.countLabel', { count: total });
  const showingLabel = t('products.showingLabel', { from, to, count: total });

  const titleEl = document.getElementById('collection-title');
  const crumbEl = document.getElementById('collection-crumb-current');
  const countPill = document.getElementById('collection-count-pill');
  const toolbarCount = document.getElementById('toolbar-product-count');
  const results = document.getElementById('collection-results');

  if (titleEl) titleEl.textContent = title;
  if (crumbEl) crumbEl.textContent = title;
  if (countPill) countPill.textContent = countLabel;
  if (toolbarCount) toolbarCount.textContent = countLabel;
  if (results) results.textContent = total ? showingLabel : countLabel;
};

const renderCollectionGrid = () => {
  const grid = document.getElementById('products-grid');
  const empty = document.getElementById('products-empty');
  if (!grid || !empty) return;

  grid.dataset.view = state.viewMode;
  grid.innerHTML = '';
  if (!state.filtered.length) {
    const title = empty.querySelector('h3');
    const text = empty.querySelector('p');
    const reset = document.getElementById('empty-reset');
    if (productLoadError) {
      if (title) title.textContent = 'Products temporarily unavailable';
      if (text) text.textContent = 'Products temporarily unavailable. Please try again.';
      if (reset) reset.classList.add('hidden');
    } else {
      if (title) title.textContent = t('products.emptyTitle');
      if (text) text.textContent = t('products.emptyText');
      if (reset) reset.classList.remove('hidden');
    }
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  const start = (state.currentPage - 1) * state.pageSize;
  const items = state.filtered.slice(start, start + state.pageSize);
  items.forEach((product) => {
    const card = createCollectionCard(product);
    card.classList.add('appear');
    card.addEventListener(
      'animationend',
      () => {
        card.classList.remove('appear');
      },
      { once: true }
    );
    grid.appendChild(card);
  });
};

const renderCollectionPagination = () => {
  const pagination = document.getElementById('products-pagination');
  if (!pagination) return;

  const totalPages = Math.ceil(state.filtered.length / state.pageSize);
  pagination.innerHTML = '';
  if (totalPages <= 1) {
    pagination.classList.add('hidden');
    return;
  }

  pagination.classList.remove('hidden');
  const pages = [];
  for (let page = 1; page <= totalPages; page += 1) {
    if (page === 1 || page === totalPages || Math.abs(page - state.currentPage) <= 1) {
      pages.push(page);
    }
  }
  const uniquePages = [...new Set(pages)];

  const createPageButton = (label, page, type = 'page') => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `pagination-btn ${type === 'page' && page === state.currentPage ? 'active' : ''}`;
    button.textContent = label;
    button.dataset.page = page;
    return button;
  };

  const prev = createPageButton('‹', Math.max(1, state.currentPage - 1), 'nav');
  prev.disabled = state.currentPage === 1;
  pagination.appendChild(prev);

  uniquePages.forEach((page, index) => {
    const prevPage = uniquePages[index - 1];
    if (index > 0 && page - prevPage > 1) {
      const dots = document.createElement('span');
      dots.className = 'pagination-dots';
      dots.textContent = '...';
      pagination.appendChild(dots);
    }
    pagination.appendChild(createPageButton(String(page), page));
  });

  const next = createPageButton('›', Math.min(totalPages, state.currentPage + 1), 'nav');
  next.disabled = state.currentPage === totalPages;
  pagination.appendChild(next);
};

const renderCollectionPage = () => {
  state.filtered = getCollectionProducts();
  renderCollectionMeta();
  renderCollectionGrid();
  renderCollectionPagination();
};

const updateCollectionShell = () => {
  const shell = document.getElementById('collection-shell');
  if (shell) shell.dataset.filtersOpen = state.filtersOpen ? 'true' : 'false';
};

const syncCollectionViewToggle = () => {
  const buttons = Array.from(document.querySelectorAll('.view-toggle-btn'));
  buttons.forEach((button) => {
    const isActive = button.dataset.view === state.viewMode;
    const label = button.dataset.view === 'list' ? t('products.viewList') : t('products.viewGrid');
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
  });

  const grid = document.getElementById('products-grid');
  if (grid) grid.dataset.view = state.viewMode;
};

const setCollectionViewMode = (mode) => {
  state.viewMode = mode === 'list' ? 'list' : 'grid';
  localStorage.setItem(COLLECTION_VIEW_KEY, state.viewMode);
  syncCollectionViewToggle();
  renderCollectionGrid();
};

const resetCollectionFilters = () => {
  state.activeFilters = {
    availability: ['in', 'out'],
    minPrice: '',
    maxPrice: '',
    category: 'all',
    tags: []
  };
  state.searchTerm = '';
  state.sortBy = 'featured';
  state.currentPage = 1;
  const search = document.getElementById('search');
  const sort = document.getElementById('sort-select');
  if (search) search.value = '';
  if (sort) sort.value = 'featured';
  syncCollectionFilterForm();
  renderCollectionPage();
};

const wireProductsPage = () => {
  if (document.body.dataset.page !== 'products') return;

  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get('category');
  if (initialCategory && products.some((product) => product.category === initialCategory)) {
    state.activeFilters.category = initialCategory;
  }

  renderCollectionFilterOptions();
  syncCollectionFilterForm();
  renderCollectionPage();
  updateCollectionShell();
  syncCollectionViewToggle();

  const search = document.getElementById('search');
  const sort = document.getElementById('sort-select');
  const filtersForm = document.getElementById('collection-filters-form');
  const filtersToggle = document.getElementById('filters-toggle');
  const filtersClose = document.getElementById('filters-close');
  const pagination = document.getElementById('products-pagination');
  const resetButton = document.getElementById('reset-filters');
  const emptyReset = document.getElementById('empty-reset');
  const viewGrid = document.getElementById('view-grid');
  const viewList = document.getElementById('view-list');

  search?.addEventListener('input', (e) => {
    state.searchTerm = e.target.value || '';
    state.currentPage = 1;
    renderCollectionPage();
  });

  sort?.addEventListener('change', (e) => {
    state.sortBy = e.target.value || 'featured';
    state.currentPage = 1;
    renderCollectionPage();
  });

  filtersForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    readCollectionFiltersFromForm();
    state.currentPage = 1;
    renderCollectionPage();
  });

  resetButton?.addEventListener('click', () => {
    resetCollectionFilters();
  });

  emptyReset?.addEventListener('click', () => {
    resetCollectionFilters();
  });

  filtersToggle?.addEventListener('click', () => {
    state.filtersOpen = !state.filtersOpen;
    updateCollectionShell();
  });

  filtersClose?.addEventListener('click', () => {
    state.filtersOpen = false;
    updateCollectionShell();
  });

  viewGrid?.addEventListener('click', () => {
    setCollectionViewMode('grid');
  });

  viewList?.addEventListener('click', () => {
    setCollectionViewMode('list');
  });

  pagination?.addEventListener('click', (e) => {
    const button = e.target.closest('.pagination-btn');
    if (!button || button.disabled) return;
    const nextPage = Number(button.dataset.page);
    if (!Number.isFinite(nextPage) || nextPage === state.currentPage) return;
    state.currentPage = nextPage;
    renderCollectionPage();
    document.querySelector('.collection-toolbar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};

const renderCartPage = async () => {
  if (document.body.dataset.page !== 'cart') return;
  const renderToken = ++cartRenderToken;
  await syncCartFromRemote();
  if (renderToken !== cartRenderToken) return;

  const list = document.getElementById('cart-list');
  const totalEl = document.getElementById('cart-total');
  const empty = document.getElementById('cart-empty');
  const wrapper = document.getElementById('cart-wrapper');
  const subtitle = document.getElementById('cart-subtitle');

  const cart = getCart();
  await ensureProducts(cart.map((c) => c.id));
  if (renderToken !== cartRenderToken) return;
  let cartChanged = false;
  const merged = cart
    .map((item) => {
      const prod = products.find((p) => idsEqual(p.id, item.id));
      if (!prod && !item.name) return null;
      const data =
        prod || { id: item.id, name: item.name || t('common.product'), price: item.price || 0, image: item.image_url || item.image || '', category: item.category || t('common.general') };
      const pricing = resolveCartItemPricing(item, prod);
      const requestedQty = Math.max(1, parseQty(item.quantity || 1));
      const availableQty = parseQty(data.quantity ?? item.stock_quantity ?? 0);
      const syncedQty = availableQty > 0 ? Math.min(requestedQty, availableQty) : requestedQty;
      if (
        syncedQty !== requestedQty ||
        parseQty(item.stock_quantity) !== availableQty ||
        Number(item.price) !== Number(pricing.price) ||
        String(item.price_currency || '').toUpperCase() !== pricing.price_currency
      ) {
        cartChanged = true;
      }
      return { ...data, ...pricing, quantity: syncedQty, stock_quantity: availableQty };
    })
    .filter((p) => p && p.quantity);

  if (cartChanged) {
    saveCart(
      merged.map((item) => ({
        ...item,
        image_url: item.image_url || item.image || '',
        stock_quantity: parseQty(item.stock_quantity ?? item.quantity ?? 0)
      }))
    );
    updateCartCount();
  }
  if (renderToken !== cartRenderToken) return;

  if (!merged.length) {
    empty.classList.remove('hidden');
    wrapper.classList.add('hidden');
    subtitle.textContent = t('cart.nothing');
    return;
  }

  empty.classList.add('hidden');
  wrapper.classList.remove('hidden');
  subtitle.textContent = t('cart.adjust');
  list.innerHTML = '';

  let total = 0;

  merged.forEach((item) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${safeUrl(item.image_url || item.image)}" alt="${escapeHtml(item.name)}">
      <div class="cart-detail">
        <h3>${escapeHtml(item.name)}</h3>
        <p class="muted">${formatStoredMoney(item.price, item.price_currency)} ${t('cart.each')}</p>
        <p class="muted">${t('cart.category')}: ${escapeHtml(item.category)}</p>
      </div>
      <div class="cart-controls">
        <div class="qty-controls" data-id="${item.id}">
          <button class="qty-btn decrement" type="button" data-id="${item.id}">−</button>
          <input type="number" min="1" ${item.stock_quantity > 0 ? `max="${item.stock_quantity}"` : ''} class="qty-input" data-id="${item.id}" value="${item.quantity}">
          <button class="qty-btn increment" type="button" data-id="${item.id}">+</button>
        </div>
        <div class="price">${formatStoredMoney(subtotal, item.price_currency)}</div>
        <button class="btn ghost remove-item" data-id="${item.id}">${t('cart.remove')}</button>
      </div>
    `;
    list.appendChild(row);
  });

  totalEl.textContent = formatStoredMoney(total, currentCurrency);
};

const loadProductReviews = async (productId, { includeOwn = true } = {}) => {
  const id = normalizeId(productId);
  if (!id || !window.db?.fetchReviewsDb) return { approved: [], own: null, all: [] };
  try {
    const approved = await window.db.fetchReviewsDb({ product_id: id, status: 'approved' });
    let own = null;
    if (includeOwn) {
      const user = getCurrentUserState();
      if (user?.id) {
        const ownRows = await window.db.fetchReviewsDb({ product_id: id, user_id: user.id });
        own = ownRows[0] || null;
      }
    }
    return { approved, own, all: approved };
  } catch (error) {
    console.error('Review load failed', error);
    return { approved: [], own: null, all: [] };
  }
};

const hasPurchasedProduct = async (productId) => {
  const user = await getCurrentUser();
  if (!user?.email) return false;
  try {
    const userOrders = await loadOrders({ user_email: user.email });
    return userOrders.some((order) =>
      Array.isArray(order.items) &&
      order.items.some((item) => idsEqual(item.id, productId))
    );
  } catch (error) {
    console.error('Purchase check failed', error);
    return false;
  }
};

const renderProductReviewsSection = async (product) => {
  if (document.body.dataset.page !== 'product') return;
  const section = document.getElementById('product-reviews-section');
  const summary = document.getElementById('product-reviews-summary');
  const list = document.getElementById('product-reviews-list');
  const formWrap = document.getElementById('product-review-form-wrap');
  if (!section || !summary || !list || !formWrap || !product) return;

  const user = await getCurrentUser();
  const [{ approved, own }, canReview] = await Promise.all([loadProductReviews(product.id), hasPurchasedProduct(product.id)]);
  reviews = approved;

  section.classList.remove('hidden');
  summary.innerHTML = `
    <div class="product-reviews-summary-card">
      <strong>${product.rating ? product.rating.toFixed(1) : '0.0'} ★</strong>
      <span class="muted">${t('product.ratingBasedOn', { count: product.reviews_count || approved.length || 0 })}</span>
    </div>
  `;

  if (!approved.length) {
    list.innerHTML = `<p class="muted">${t('product.reviewEmpty')}</p>`;
  } else {
    list.innerHTML = approved
      .map(
        (review) => `
          <article class="review-card">
            <div class="review-card-head">
              <div>
                <strong>${escapeHtml(review.user_name || review.user_email || 'Customer')}</strong>
                <p class="muted small">${formatDateTime(review.created_at)}</p>
              </div>
              <span class="review-rating-badge">${Number(review.rating || 0).toFixed(1)} ★</span>
            </div>
            <p>${escapeHtml(review.comment || '')}</p>
          </article>
        `
      )
      .join('');
  }

  if (!user) {
    formWrap.innerHTML = `<p class="muted">${t('product.reviewPurchasedOnly')}</p>`;
    return;
  }

  const statusMessage =
    own?.status === 'pending'
      ? `<p class="muted small">${t('product.reviewPending')}</p>`
      : own?.status === 'rejected'
      ? `<p class="muted small">${t('product.reviewRejected')}</p>`
      : '';

  if (!canReview) {
    formWrap.innerHTML = `<p class="muted">${t('product.reviewPurchasedOnly')}</p>`;
    return;
  }

  formWrap.innerHTML = `
    <form id="product-review-form" class="review-form glass">
      <div class="section-header compact">
        <div>
          <h3>${t('product.reviewFormTitle')}</h3>
          ${statusMessage}
        </div>
      </div>
      <div class="form-row">
        <label for="review-rating">${t('product.reviewRatingLabel')}</label>
        <input id="review-rating" name="rating" type="number" min="1" max="5" step="1" value="${Math.max(1, Number(own?.rating) || 5)}">
      </div>
      <div class="form-row">
        <label for="review-comment">${t('product.reviewCommentLabel')}</label>
        <textarea id="review-comment" name="comment" rows="4" placeholder="${t('product.reviewCommentPlaceholder')}">${own?.comment || ''}</textarea>
      </div>
      <button class="btn primary" type="submit">${t('product.reviewSubmit')}</button>
      <p id="review-form-message" class="muted small"></p>
    </form>
  `;

  const form = document.getElementById('product-review-form');
  const formMessage = document.getElementById('review-form-message');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const purchased = await hasPurchasedProduct(product.id);
    if (!purchased) {
      if (formMessage) formMessage.textContent = t('product.reviewPurchasedOnly');
      return;
    }
    const rating = Math.min(5, Math.max(1, Number(form.querySelector('#review-rating')?.value || 5)));
    const comment = String(form.querySelector('#review-comment')?.value || '').trim();
    if (!comment) {
      if (formMessage) formMessage.textContent = t('product.reviewCommentPlaceholder');
      return;
    }
    try {
      const data = await window.db?.upsertReviewDb?.({
        product_id: product.id,
        rating,
        comment,
        status: 'pending'
      });
      console.log('SUPABASE RESPONSE:', data);
      console.log('SUPABASE ERROR:', null);
      if (formMessage) formMessage.textContent = t('product.reviewSubmitted');
      await renderProductReviewsSection(product);
    } catch (error) {
      console.log('SUPABASE RESPONSE:', null);
      console.log('SUPABASE ERROR:', error);
      if (formMessage) formMessage.textContent = error?.message || 'Review error';
    }
  });
};

const renderProductPage = async () => {
  if (document.body.dataset.page !== 'product') return;
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  if (!productId) {
    document.getElementById('product-error')?.classList.remove('hidden');
    document.getElementById('product-shell')?.classList.add('hidden');
    return;
  }
  try {
    if (window.db?.fetchProductsByIdsDb) {
      const rows = await window.db.fetchProductsByIdsDb([productId]);
      const p = rows?.[0];
      if (!p) throw new Error('Not found');
      const existingIndex = products.findIndex((item) => idsEqual(item.id, p.id));
      if (existingIndex >= 0) products[existingIndex] = p;
      else products.push(p);
      fillProductPage(p);
      renderProductSpecsSection(p);
      renderRelatedProducts(p.id);
      await renderProductReviewsSection(p);
      if (products.length <= 1) {
        setTimeout(async () => {
          try {
            await loadProducts();
            renderRelatedProducts(p.id);
          } catch (error) {
            console.error('Background related products load failed', error);
          }
        }, 0);
      }
      return;
    }
    const fallback = products.find((item) => idsEqual(item.id, productId));
    if (fallback) {
      fillProductPage(fallback);
      renderRelatedProducts(fallback.id);
      renderProductSpecsSection(fallback);
      await renderProductReviewsSection(fallback);
      return;
    }
    throw new Error('Not found');
  } catch (e) {
    console.error(e);
    document.getElementById('product-error')?.classList.remove('hidden');
    document.getElementById('product-shell')?.classList.add('hidden');
  }
};

const fillProductPage = (p) => {
  const mainImg = document.getElementById('product-main');
  const thumbs = document.getElementById('product-thumbs');
  const mediaSwitcher = document.getElementById('product-media-switcher');
  const imageTab = document.getElementById('media-tab-images');
  const modelTab = document.getElementById('media-tab-model');
  const modelWrap = document.getElementById('product-model-wrap');
  const modelViewer = document.getElementById('product-model');
  const nameEl = document.getElementById('product-name');
  const descEl = document.getElementById('product-desc');
  const priceEl = document.getElementById('product-price');
  const stockEl = document.getElementById('product-stock');
  const ratingEl = document.getElementById('product-rating');
  const reviewsEl = document.getElementById('product-reviews');
  const colorRow = document.getElementById('color-row');
  const safetyRow = document.getElementById('product-safety-row');
  const safetyBlock = document.getElementById('product-safety-block');
  const safetyGrid = document.getElementById('product-safety-grid');
  const tabDescription = document.getElementById('product-tab-description');
  const tabDetails = document.getElementById('product-tab-details');
  const specGrid = document.getElementById('spec-grid');
  const specsBtn = document.getElementById('specs-scroll-btn');
  const wishlistBtn = document.getElementById('btn-wishlist');
  if (!p) return;
  const colors = parseProductColors(p.color);
  const safetyEntries = buildSafetyEntries(p);
  const pricing = getDisplayPriceInfo(p);
  nameEl.textContent = p.name;
  const descriptionMarkup = `${renderTextParagraphs(p.desc)}${p.features ? `<p class="muted">${escapeHtml(p.features)}</p>` : ''}`;
  descEl.innerHTML = descriptionMarkup;
  if (tabDescription) tabDescription.innerHTML = descriptionMarkup || `<p class="muted">${t('common.notSpecified')}</p>`;
  priceEl.textContent = formatMoneyValue(pricing.displayAmount, pricing.displayCurrency);
  const qty = parseQty(p.quantity);
  if (qty > 5) stockEl.textContent = t('product.inStock');
  else if (qty > 0) stockEl.textContent = t('product.onlyLeft', { count: qty });
  else stockEl.textContent = t('product.outOfStock');
  ratingEl.textContent = p.rating ? `${p.rating.toFixed(1)} ★` : t('common.dash');
  reviewsEl.textContent = `${p.reviews_count || 0} ${t('product.reviews')}`;
  if (imageTab) imageTab.textContent = t('product.photosTab');
  if (modelTab) modelTab.textContent = t('product.modelTab');
  if (wishlistBtn) {
    const active = isFavorite(p.id);
    wishlistBtn.dataset.id = p.id;
    wishlistBtn.classList.toggle('active', active);
    wishlistBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
    wishlistBtn.setAttribute('aria-label', active ? t('product.removeFromWishlist') : t('product.addToWishlist'));
    wishlistBtn.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20.2 4.9 13.4a4.8 4.8 0 0 1 6.8-6.8L12 7l.3-.4a4.8 4.8 0 0 1 6.8 6.8Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
      <span data-favorite-label>${active ? t('product.removeFromWishlist') : t('product.addToWishlist')}</span>
    `;
  }

  const gallery = p.gallery_images && p.gallery_images.length ? p.gallery_images : [p.image];
  let current = gallery[0];
  const canShowModel = Boolean(p.show_3d && p.model_url);

  const setMediaMode = (mode) => {
    const showModel = mode === 'model' && canShowModel;
    mainImg?.classList.toggle('hidden', showModel);
    modelWrap?.classList.toggle('hidden', !showModel);
    if (imageTab) imageTab.classList.toggle('active', !showModel);
    if (modelTab) modelTab.classList.toggle('active', showModel);
  };

  if (mainImg) {
    mainImg.src = safeUrl(current);
    mainImg.alt = p.name;
  }
  if (modelViewer) {
    if (canShowModel) {
      modelViewer.setAttribute('src', safeUrl(p.model_url, { allowDataImage: false }));
      modelViewer.setAttribute('alt', p.name);
    } else {
      modelViewer.removeAttribute('src');
      modelViewer.setAttribute('alt', p.name || '3D model');
    }
  }
  if (mediaSwitcher) {
    mediaSwitcher.classList.toggle('hidden', !canShowModel);
  }
  setMediaMode('image');
  if (imageTab) {
    imageTab.textContent = t('product.photosTab');
    imageTab.onclick = () => setMediaMode('image');
  }
  if (modelTab) {
    modelTab.textContent = t('product.modelTab');
    modelTab.onclick = () => setMediaMode('model');
  }
  if (thumbs) {
    thumbs.innerHTML = '';
    gallery.forEach((url) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'thumb';
      btn.innerHTML = `<img src=\"${safeUrl(url)}\" alt=\"thumb\">`;
      btn.addEventListener('click', () => {
        current = url;
        mainImg.src = safeUrl(url);
        setMediaMode('image');
      });
      thumbs.appendChild(btn);
    });
  }

  colorRow.innerHTML = colors.length
    ? `
      <div class="color-picker-block">
        <span class="color-picker-label">${t('product.color')}:</span>
        <div class="color-swatches">
          ${colors
            .map((colorName) => {
              const swatch = resolveColorSwatch(colorName);
              return `
                <div class="color-swatch-card ${swatch.dark ? 'dark-swatch' : ''}" title="${swatch.label}">
                  <span class="color-swatch-dot" style="background:${swatch.background};"></span>
                  <span class="color-swatch-name">${swatch.label}</span>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    `
    : '';

  if (safetyRow) {
    const pills = [
      p.age_rating ? `<span class="safety-pill highlight">${escapeHtml(p.age_rating)}</span>` : '',
      ...normalizeSafetyList(p.certifications).map((item) => `<span class="safety-pill">${escapeHtml(item)}</span>`)
    ].filter(Boolean);
    safetyRow.innerHTML = pills.join('');
    safetyRow.classList.toggle('hidden', !pills.length);
  }

  if (safetyBlock && safetyGrid) {
    if (safetyEntries.length) {
      safetyBlock.classList.remove('hidden');
      safetyGrid.innerHTML = renderInfoCards(safetyEntries);
    } else {
      safetyBlock.classList.add('hidden');
      safetyGrid.innerHTML = '';
    }
  }

  if (tabDetails) {
    const entries = buildProductDetailEntries(p);
    tabDetails.innerHTML = entries.length ? renderInfoCards(entries) : `<p class="muted">${t('common.notSpecified')}</p>`;
  }

  specGrid.innerHTML = `
    ${p.type ? `<div><span class=\"muted tiny\">${t('product.type')}</span><div>${escapeHtml(p.type)}</div></div>` : ''}
    ${p.transport_type ? `<div><span class=\"muted tiny\">${t('product.transport')}</span><div>${escapeHtml(p.transport_type)}</div></div>` : ''}
    ${p.control_type ? `<div><span class=\"muted tiny\">${t('product.control')}</span><div>${escapeHtml(p.control_type)}</div></div>` : ''}
    ${p.features ? `<div><span class=\"muted tiny\">${t('product.features')}</span><div>${escapeHtml(p.features)}</div></div>` : ''}
    ${p.country ? `<div><span class=\"muted tiny\">${t('product.country')}</span><div>${escapeHtml(p.country)}</div></div>` : ''}
    ${p.size ? `<div><span class=\"muted tiny\">${t('product.size')}</span><div>${escapeHtml(p.size)}</div></div>` : ''}
  `;

  const addBtn = document.getElementById('btn-add-cart');
  const buyBtn = document.getElementById('btn-buy-now');
  const askBtn = document.getElementById('btn-ask-question');
  if (addBtn) addBtn.textContent = t('product.addToCart');
  if (buyBtn) buyBtn.textContent = t('product.buyNow');
  if (askBtn) askBtn.textContent = t('product.askQuestion');
  if (specsBtn) specsBtn.textContent = t('product.specsButton');

  if (addBtn) addBtn.onclick = () => addToCart(p.id, { triggerEl: addBtn });
  if (buyBtn) buyBtn.onclick = () => {
    addToCart(p.id, { triggerEl: buyBtn });
    window.location.href = 'checkout.html';
  };
  if (askBtn) askBtn.onclick = () => {
    openSupportModal({ source: 'product_question', product: p });
  };
  if (wishlistBtn) {
    wishlistBtn.onclick = async () => {
      try {
        await toggleFavorite(p.id);
      } catch (error) {
        console.error(error);
      }
    };
  }
  refreshFavoriteControls(p.id);
};

const clampCartQtyByStock = (id, qty) => {
  const nextQty = Math.max(1, parseQty(qty));
  const product = products.find((p) => idsEqual(p.id, id));
  const availableQty = parseQty(product?.quantity);
  if (availableQty > 0 && nextQty > availableQty) {
    showToast(t('common.limitReached'));
    return availableQty;
  }
  return nextQty;
};

const updateQuantity = (id, qty) => {
  const cart = getCart();
  const item = cart.find((c) => idsEqual(c.id, id));
  if (!item) return;
  item.quantity = clampCartQtyByStock(id, qty);
  saveCart(cart);
  syncCartImmediately(cart);
  updateCartCount();
  renderCartPage();
};

const adjustQuantity = (id, delta) => {
  const cart = getCart();
  const item = cart.find((c) => idsEqual(c.id, id));
  if (!item) return;
  item.quantity = clampCartQtyByStock(id, item.quantity + delta);
  saveCart(cart);
  syncCartImmediately(cart);
  updateCartCount();
  renderCartPage();
};

const removeItem = (id) => {
  let cart = getCart();
  cart = cart.filter((c) => !idsEqual(c.id, id));
  saveCart(cart);
  syncCartImmediately(cart);
  updateCartCount();
  renderCartPage();
};

const wireCartEvents = () => {
  const checkout = document.getElementById('checkout');
  checkout?.addEventListener('click', () => {
    window.location.href = 'checkout.html';
  });

  document.body.addEventListener('click', (e) => {
    const favoriteBtn = e.target.closest('.favorite-toggle');
    if (favoriteBtn) {
      e.preventDefault();
      toggleFavorite(favoriteBtn.dataset.id).catch((error) => {
        console.error(error);
      });
      return;
    }

    const addBtn = e.target.closest('.add-to-cart');
    if (addBtn) {
      const id = addBtn.dataset.id;
      addToCart(id, { triggerEl: addBtn });
    }

    const removeBtn = e.target.closest('.remove-item');
    if (removeBtn) {
      const id = normalizeId(removeBtn.dataset.id);
      removeItem(id);
    }

    const incBtn = e.target.closest('.increment');
    if (incBtn) {
      const id = incBtn.dataset.id;
      adjustQuantity(id, 1);
    }

    const decBtn = e.target.closest('.decrement');
    if (decBtn) {
      const id = decBtn.dataset.id;
      adjustQuantity(id, -1);
    }

    const viewBtn = e.target.closest('.view-product');
    if (viewBtn) {
      const id = viewBtn.dataset.id;
      const product = products.find((p) => idsEqual(p.id, id));
      if (product) openProductModal(product);
    }
  });

  document.body.addEventListener('input', (e) => {
    if (e.target.classList.contains('qty-input')) {
      const id = normalizeId(e.target.dataset.id);
      const qty = Math.max(1, Number(e.target.value) || 1);
      updateQuantity(id, qty);
    }
  });
};

const wireBackButtons = () => {
  document.querySelectorAll('.back-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      history.back();
    });
  });
};

const isRussianLocale = () => String(navigator.language || navigator.languages?.[0] || '').toLowerCase().startsWith('ru');

const normalizeCheckoutPaymentMethod = (value) => {
  const method = String(value || '')
    .trim()
    .toLowerCase();
  if (!method) return '';
  if (['sbp', 'sberpay', 'yoomoney', 'sbp_yookassa', 'russian'].includes(method)) return 'sbp_yookassa';
  return 'stripe';
};

const normalizePaymentResult = (result = {}) => {
  const status = String(result?.status || result?.payment_status || '').trim().toLowerCase();
  const paid = result?.paid === true || ['paid', 'succeeded', 'success'].includes(status);
  return { paid, status: status || (paid ? 'paid' : 'pending'), raw: result };
};

const startOrderPayment = async ({ orderId, method, amount, user, items, address }) => {
  const provider = normalizeCheckoutPaymentMethod(method);
  const intentPayload = {
    provider,
    order_id: orderId,
    amount,
    currency: 'RUB',
    user_email: (user?.email || '').trim().toLowerCase(),
    user_name: (user?.user_metadata?.full_name || '').trim(),
    address: String(address || '').trim(),
    items: Array.isArray(items) ? items : []
  };

  if (!window.db?.createPaymentIntentDb) {
    throw new Error('Payment backend is not configured');
  }

  const intentData = await window.db.createPaymentIntentDb(intentPayload);
  const firstPass = normalizePaymentResult(intentData || {});
  if (firstPass.paid) return firstPass;

  if (!window.db?.confirmPaymentDb) {
    return firstPass;
  }

  const confirmPayload = {
    provider,
    order_id: orderId,
    payment_intent_id: intentData?.payment_intent_id || intentData?.intent_id || intentData?.id || '',
    client_secret: intentData?.client_secret || ''
  };
  const confirmData = await window.db.confirmPaymentDb(confirmPayload);
  return normalizePaymentResult(confirmData || intentData || {});
};

const renderCheckout = async () => {
  if (document.body.dataset.page !== 'checkout') return;

  const authUser = await getCurrentUser();
  if (!authUser) {
    window.location.href = `login.html?redirect=${encodeURIComponent('checkout.html')}`;
    return;
  }
  await syncCartFromRemote();

  const itemsWrap = document.getElementById('checkout-items');
  const totalEl = document.getElementById('checkout-total');
  const empty = document.getElementById('checkout-empty');
  const wrapper = document.getElementById('checkout-wrapper');
  const subtitle = document.getElementById('checkout-subtitle');
  const form = document.getElementById('payment-form');
  const confirmation = document.getElementById('confirmation');
  const paymentFeedback = document.getElementById('payment-feedback');
  const submitBtn = form?.querySelector('button[type="submit"]');

  const setProcessingState = (loading) => {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? t('checkout.processing') : t('checkout.payNow');
  };

  const setFeedback = (message = '', type = '') => {
    if (!paymentFeedback) return;
    paymentFeedback.className = 'checkout-feedback';
    if (!message) {
      paymentFeedback.textContent = '';
      paymentFeedback.classList.add('hidden');
      return;
    }
    paymentFeedback.textContent = message;
    paymentFeedback.classList.add(`is-${type || 'info'}`);
    paymentFeedback.classList.remove('hidden');
  };

  const cart = getCart();
  await ensureProducts(cart.map((c) => c.id));
  const merged = cart
    .map((item) => {
      const prod = products.find((p) => idsEqual(p.id, item.id));
      if (!prod && !item.name) return null;
      const data =
        prod || { id: item.id, name: item.name || t('common.product'), price: item.price || 0, image: item.image_url || item.image || '', category: item.category || t('common.general') };
      const pricing = resolveCartItemPricing(item, prod);
      return { ...data, ...pricing, quantity: item.quantity || 1, image_url: item.image_url || item.image || '' };
    })
    .filter((p) => p && p.quantity);

  if (!merged.length) {
    empty.classList.remove('hidden');
    wrapper.classList.add('hidden');
    subtitle.textContent = t('cart.empty');
    return;
  }

  empty.classList.add('hidden');
  wrapper.classList.remove('hidden');
  subtitle.textContent = t('checkout.finish');
  itemsWrap.innerHTML = '';

  let total = 0;
  merged.forEach((item) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    const row = document.createElement('div');
    row.className = 'checkout-item';
    row.innerHTML = `
      <img src="${safeUrl(item.image_url || item.image)}" alt="${escapeHtml(item.name)}">
      <div>
        <h3>${escapeHtml(item.name)}</h3>
        <p class="muted">${formatStoredMoney(item.price, item.price_currency)} x ${item.quantity}</p>
      </div>
      <div class="price">${formatStoredMoney(subtotal, item.price_currency)}</div>
    `;
    itemsWrap.appendChild(row);
  });

  totalEl.textContent = formatStoredMoney(total, currentCurrency);
  setupCustomSelect({ preferRussian: isRussianLocale() });

  if (form && form.dataset.bound !== '1') {
    form.dataset.bound = '1';
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setFeedback('');
      confirmation.classList.add('hidden');
      setProcessingState(true);

      const user = await getCurrentUser();
      if (!user) {
        window.location.href = `login.html?redirect=${encodeURIComponent('checkout.html')}`;
        return;
      }

      const orderItems = merged.map((m) => ({
        id: m.id,
        name: m.name,
        price: m.price,
        currency: m.price_currency,
        pricing_region: m.pricing_region,
        quantity: m.quantity,
        image_url: m.image_url || m.image || ''
      }));

      const addressValue = (document.getElementById('address')?.value || '').trim();
      if (!addressValue) {
        setProcessingState(false);
        setFeedback(t('checkout.addressRequired'), 'error');
        return;
      }

      const selectedMethod = normalizeCheckoutPaymentMethod(document.getElementById('payment')?.value || '');
      if (!selectedMethod) {
        setProcessingState(false);
        setFeedback(t('checkout.paymentRequired'), 'error');
        return;
      }

      try {
        if (!window.db?.secureCheckoutDb) {
          throw new Error('Secure checkout is not configured. Deploy secure-checkout function in Supabase.');
        }
        const orderData = await window.db.secureCheckoutDb({
          user_name: (document.getElementById('name')?.value || user?.user_metadata?.full_name || '').trim(),
          address: addressValue,
          payment_method: selectedMethod,
          items: orderItems.map((item) => ({
            id: item.id,
            quantity: item.quantity
          })),
          locale: currentLanguage,
          pricing_region: currentPricingRegion,
          currency: currentCurrency
        });
        console.log('SUPABASE RESPONSE:', orderData);
        console.log('SUPABASE ERROR:', null);
        const paid = orderData?.paid === true || String(orderData?.payment_status || '').toLowerCase() === 'paid';
        const orderCreated = orderData?.order_created === true || Boolean(orderData?.order?.id || orderData?.order_id);
        if (!orderCreated) {
          throw new Error(orderData?.message || 'Secure checkout failed');
        }

        await clearCart();
        if (paid) {
          setFeedback('', '');
        } else {
          setFeedback(orderData?.message || t('checkout.paymentPending'), 'pending');
        }
        confirmation.classList.remove('hidden');
        confirmation.textContent = paid ? t('checkout.thanks') : orderData?.message || t('checkout.paymentPending');
        itemsWrap.innerHTML = '';
        totalEl.textContent = formatStoredMoney(0, currentCurrency);
        subtitle.textContent = paid ? t('checkout.thanks') : t('checkout.paymentPending');
        orders = await loadOrders(isAdmin() ? {} : { user_email: user.email });
        products = await loadProducts();
      } catch (error) {
        console.log('SUPABASE RESPONSE:', null);
        console.log('SUPABASE ERROR:', error);
        console.error(error);
        setFeedback(error?.message || t('checkout.paymentFailed'), 'error');
        showToast(error?.message || 'Checkout failed');
      } finally {
        setProcessingState(false);
      }
    });
  }

  const currentUser = authUser;
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  if (nameInput && currentUser?.user_metadata?.full_name) nameInput.value = currentUser.user_metadata.full_name;
  if (emailInput && currentUser?.email) emailInput.value = currentUser.email;
};

const setupCustomSelect = ({ preferRussian = false } = {}) => {
  const select = document.querySelector('.custom-select');
  if (!select) return;
  const toggle = select.querySelector('.select-toggle');
  const optionsWrap = select.querySelector('.select-options');
  const hidden = select.querySelector('input[type="hidden"]');
  if (!toggle || !optionsWrap || !hidden) return;

  const options = Array.from(optionsWrap.querySelectorAll('li'));
  const preferredOrder = preferRussian ? ['sbp_yookassa', 'stripe'] : ['stripe', 'sbp_yookassa'];
  options
    .sort((a, b) => preferredOrder.indexOf(a.dataset.value) - preferredOrder.indexOf(b.dataset.value))
    .forEach((opt) => optionsWrap.appendChild(opt));

  const close = () => {
    select.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  const open = () => {
    select.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  };

  const setValue = (value, label) => {
    hidden.value = value;
    if (toggle.firstChild && toggle.firstChild.nodeType === Node.TEXT_NODE) {
      toggle.firstChild.textContent = `${label} `;
    } else {
      toggle.prepend(document.createTextNode(`${label} `));
    }
    optionsWrap.querySelectorAll('li').forEach((opt) => {
      opt.setAttribute('aria-selected', opt.dataset.value === value ? 'true' : 'false');
    });
  };

  const current = optionsWrap.querySelector('li');
  if (current) setValue(current.dataset.value, current.textContent.trim());

  if (toggle.dataset.bound !== '1') {
    toggle.dataset.bound = '1';
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = select.classList.contains('open');
      isOpen ? close() : open();
    });
  }

  optionsWrap.querySelectorAll('li').forEach((opt) => {
    if (opt.dataset.bound === '1') return;
    opt.dataset.bound = '1';
    opt.addEventListener('click', () => {
      setValue(opt.dataset.value, opt.textContent.trim());
      close();
    });
    opt.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        opt.click();
      }
    });
  });

  if (select.dataset.outsideBound !== '1') {
    select.dataset.outsideBound = '1';
    document.addEventListener('click', (e) => {
      if (!select.contains(e.target)) close();
    });
  }
};

const isAdmin = () => {
  return getCurrentUserRoleState() === 'admin';
};

const isActiveOrderStatus = (status) => ['pending', 'processing', 'shipped', 'pickup'].includes(normalizeOrderStatus(status));

const renderOrderTimeline = (status) => {
  const normalized = normalizeOrderStatus(status);
  const currentIndex = ORDER_TIMELINE_STEPS.indexOf(normalized);
  return `
    <div class="order-timeline" aria-label="${orderStatusLabel(normalized)}">
      ${ORDER_TIMELINE_STEPS.map((step, index) => {
        const done = currentIndex >= index;
        const current = normalized === step;
        return `
          <div class="timeline-step ${done ? 'done' : ''} ${current ? 'current' : ''}">
            <span class="timeline-dot"></span>
            <span class="timeline-label">${orderStatusLabel(step)}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
};

const renderProfile = async () => {
  if (document.body.dataset.page !== 'profile') return;

  const infoEl = document.getElementById('profile-info');
  const statusEl = document.getElementById('order-status');
  const historyEl = document.getElementById('order-history');
  if (!statusEl || !historyEl || !infoEl) return;

  const user = await getCurrentUser();
  if (!user) {
    window.location.href = 'login.html?redirect=profile.html';
    return;
  }
  const role = await getUserRole();
  const displayRole = role === 'admin' ? 'admin' : 'user';

  const userOrders = await loadOrders({ user_email: user.email });
  const latestOrder = userOrders[0] || null;
  const activeOrdersCount = userOrders.filter((order) => isActiveOrderStatus(order.status)).length;
  const activeOrderId = (userOrders.find((order) => isActiveOrderStatus(order.status)) || latestOrder)?.id;
  const lastOrderLabel = latestOrder ? formatDateTime(latestOrder.created_at) : '—';
  const displayName = user.user_metadata?.full_name || user.email;
  const roleBadge = role === 'admin' ? `<span class="status-pill">${t('profile.role')}: ${displayRole}</span>` : '';

  infoEl.innerHTML = `
    <div class="profile-summary">
      <div class="profile-summary-main">
        <div class="profile-avatar">${displayName.charAt(0).toUpperCase()}</div>
        <div class="profile-summary-copy">
          <h3>${escapeHtml(displayName)}</h3>
          <p class="muted">${escapeHtml(user.email)}</p>
          ${roleBadge ? `<div class="profile-summary-meta">${roleBadge}</div>` : ''}
        </div>
      </div>
      <div class="profile-stats">
        <article class="profile-stat-card">
          <span class="muted small">${t('profile.ordersCount')}</span>
          <strong>${userOrders.length}</strong>
        </article>
        <article class="profile-stat-card">
          <span class="muted small">${t('profile.activeOrders')}</span>
          <strong>${activeOrdersCount}</strong>
        </article>
        <article class="profile-stat-card">
          <span class="muted small">${t('profile.lastOrder')}</span>
          <strong>${lastOrderLabel}</strong>
        </article>
      </div>
    </div>
  `;

  const renderOrderItems = (items = [], fallbackCurrency = currentCurrency) => {
    if (!Array.isArray(items) || !items.length) {
      return `<p class="muted small">${t('profile.noProducts')}</p>`;
    }
    return `
      <div class="profile-items">
        ${items
          .map(
            (item) => `
              <article class="profile-item-card">
                <img src="${safeUrl(item.image_url || item.image || '')}" alt="${escapeHtml(item.name || t('common.product'))}">
                <div class="profile-item-copy">
                  <h4>${escapeHtml(item.name || t('common.product'))}</h4>
                  <p class="muted small">${formatStoredMoney(Number(item.price) || 0, item.currency || item.price_currency || fallbackCurrency)} x ${item.quantity || item.qty || 1}</p>
                  ${item.id ? `<a class="profile-item-link" href="product.html?id=${item.id}">${t('profile.viewProduct')}</a>` : ''}
                </div>
              </article>
            `
          )
          .join('')}
      </div>
    `;
  };

  if (!userOrders.length) {
    statusEl.innerHTML = `
      <div class="profile-featured-order empty">
        <h3>${t('profile.currentOrder')}</h3>
        <p class="muted">${t('profile.noOrders')}</p>
      </div>
    `;
  } else {
    const active = userOrders.find((order) => idsEqual(order.id, activeOrderId)) || userOrders[0];
    const activeOrderCurrency = active.currency || currentCurrency;
    const itemCount = Array.isArray(active.items)
      ? active.items.reduce((sum, item) => sum + Number(item.quantity || item.qty || 1), 0)
      : Number(active.items) || 0;
    statusEl.innerHTML = `
      <div class="profile-featured-order">
        <div class="profile-featured-head">
          <div>
            <p class="muted small">${t('profile.activeOrderTitle')}</p>
            <h3>${t('profile.order')} #${active.id}</h3>
            <p class="muted">${t('profile.activeOrderSubtitle')}</p>
          </div>
          <span class="status-pill">${orderStatusLabel(active.status)}</span>
        </div>
        <div class="profile-featured-grid">
          <div class="profile-detail-card">
            <span class="muted small">${t('profile.placedOn')}</span>
            <strong>${formatDateTime(active.created_at)}</strong>
          </div>
          <div class="profile-detail-card">
            <span class="muted small">${t('cart.total')}</span>
            <strong>${formatStoredMoney(active.total || 0, activeOrderCurrency)}</strong>
          </div>
          <div class="profile-detail-card">
            <span class="muted small">${t('profile.items')}</span>
            <strong>${t('profile.productsCount', { count: itemCount })}</strong>
          </div>
          <div class="profile-detail-card">
            <span class="muted small">${t('profile.paymentMethod')}</span>
            <strong>${active.payment_method || '—'}</strong>
          </div>
        </div>
        <div class="profile-order-timeline-wrap">
          <span class="muted small">${t('profile.timelineTitle')}</span>
          ${renderOrderTimeline(active.status)}
        </div>
        ${active.address ? `<div class="profile-order-extra"><span class="muted small">${t('profile.address')}</span><p>${escapeHtml(active.address)}</p></div>` : ''}
        ${renderOrderItems(active.items, activeOrderCurrency)}
      </div>
    `;
  }

  historyEl.innerHTML = '';
  const previousOrders = userOrders.filter((order) => !idsEqual(order.id, activeOrderId));
  if (!previousOrders.length) {
    historyEl.innerHTML = `<div class="history-row history-empty"><p class="muted">${t('profile.noHistory')}</p></div>`;
    return;
  }

  previousOrders.forEach((order) => {
    const orderCurrency = order.currency || currentCurrency;
    const itemCount = Array.isArray(order.items)
      ? order.items.reduce((sum, item) => sum + Number(item.quantity || item.qty || 1), 0)
      : Number(order.items) || 0;
    const row = document.createElement('div');
    row.className = 'history-row';
    const detailsId = `order-details-${order.id}`;
    row.innerHTML = `
      <div class="history-head">
        <div class="history-main">
          <strong>${t('profile.order')} #${order.id}</strong>
          <p class="muted">${formatDateTime(order.created_at)}</p>
        </div>
        <div class="history-side">
          <span class="status-pill">${orderStatusLabel(order.status)}</span>
          <span class="price">${formatStoredMoney(order.total, orderCurrency)}</span>
        </div>
      </div>
      <div class="history-meta">
        <span class="muted small">${t('profile.items')}: ${t('profile.productsCount', { count: itemCount })}</span>
        ${order.payment_method ? `<span class="muted small">${t('profile.paymentMethod')}: ${order.payment_method}</span>` : ''}
      </div>
      <div class="history-actions">
        <button class="btn ghost small-btn history-toggle-btn" type="button" aria-expanded="false" aria-controls="${detailsId}">${t('profile.showDetails')}</button>
      </div>
      <div id="${detailsId}" class="history-details hidden">
        <div class="profile-order-timeline-wrap compact">
          ${renderOrderTimeline(order.status)}
        </div>
        ${order.address ? `<p class="muted small history-address">${t('profile.address')}: ${escapeHtml(order.address)}</p>` : ''}
        ${renderOrderItems(order.items, orderCurrency)}
      </div>
    `;
    const toggleBtn = row.querySelector('.history-toggle-btn');
    const detailsEl = row.querySelector('.history-details');
    toggleBtn?.addEventListener('click', () => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      toggleBtn.textContent = expanded ? t('profile.showDetails') : t('profile.hideDetails');
      detailsEl?.classList.toggle('hidden', expanded);
    });
    historyEl.appendChild(row);
  });
};

const renderAdminProducts = () => {
  if (document.body.dataset.page !== 'admin') return;
  const list = document.getElementById('admin-products');
  if (!list) return;
  list.innerHTML = '';
  products.forEach((p) => {
    const baseRegion = normalizePricingRegion(p.base_pricing_region || 'eurasia');
    const baseCurrency = REGION_PRICING_CONFIG[baseRegion]?.currency || 'RUB';
    const baseRegionLabel = t(REGION_PRICING_CONFIG[baseRegion]?.nameKey || 'admin.regionEurasia');
    const item = document.createElement('div');
    item.className = 'admin-item';
    item.innerHTML = `
      <img src="${safeUrl(p.image)}" alt="${escapeHtml(p.name)}">
      <div>
        <strong>${escapeHtml(p.name)}</strong>
        <p class="muted">${formatStoredMoney(p.price, baseCurrency)} · ${baseRegionLabel} · ${t('admin.qty')}: ${displayQty(p.quantity)} · ${t('admin.category')}: ${escapeHtml(p.category || t('common.general'))}</p>
      </div>
      <div class="admin-actions">
        <button class="btn ghost small-btn edit-prod" data-id="${p.id}">${t('admin.edit')}</button>
        <button class="btn ghost small-btn delete-prod" data-id="${p.id}">${t('admin.delete')}</button>
      </div>
    `;
    list.appendChild(item);
  });
};

const renderAdminOrders = () => {
  if (document.body.dataset.page !== 'admin') return;
  const wrap = document.getElementById('admin-orders');
  if (!wrap) return;
  wrap.innerHTML = '';
  orders.forEach((o) => {
    const itemText = Array.isArray(o.items)
      ? o.items.map((i) => `${i.name || t('common.product')} x${i.quantity || i.qty || 1}`).join(', ')
      : `${t('profile.items')}: ${o.items || 0}`;
    const status = normalizeOrderStatus(o.status);
    const options = ORDER_STATUS_OPTIONS.map((s) => `<option value="${s}" ${s === status ? 'selected' : ''}>${orderStatusLabel(s)}</option>`).join('');
    const row = document.createElement('div');
    row.className = 'order-row';
    row.innerHTML = `
      <div>
        <strong>${o.id}</strong>
        <p class="muted">${o.user_email || ''}</p>
        <p class="muted">${formatDateTime(o.created_at)}</p>
        <p class="muted">${itemText}</p>
        <p class="muted">${t('checkout.paymentMethod')}: ${o.payment_method || t('common.dash')} · ${t('common.status')}: ${o.payment_status || 'pending'}</p>
      </div>
      <div>
        <label class="muted small">${t('admin.status')}</label>
        <select class="order-status-select" data-order-id="${o.id}">
          ${options}
        </select>
      </div>
      <span class="price">${formatStoredMoney(o.total || 0, o.currency || currentCurrency)}</span>
    `;
    wrap.appendChild(row);
  });
};

const renderAdminQuestions = () => {
  if (document.body.dataset.page !== 'admin') return;
  const wrap = document.getElementById('admin-questions');
  if (!wrap) return;
  wrap.innerHTML = '';
  if (!supportMessages.length) {
    wrap.innerHTML = `<p class="muted">${t('admin.noQuestions')}</p>`;
    return;
  }

  supportMessages.forEach((msg) => {
    const card = document.createElement('article');
    card.className = 'admin-question-card';
    const status = normalizeSupportStatus(msg.status);
    const fromLabel = msg.user_name ? `${msg.user_name} (${msg.user_email || '—'})` : msg.user_email || '—';
    const productLine = msg.product_name
      ? `<p class="muted small">${t('support.product')}: <strong>${escapeHtml(msg.product_name)}</strong></p>`
      : '';
    card.innerHTML = `
      <div class="admin-question-meta">
        <span class="admin-question-source">${supportSourceLabel(msg.source)}</span>
        <span class="muted small">${formatDateTime(msg.created_at)}</span>
        <select class="admin-question-status question-status-select" data-id="${msg.id}">
          <option value="new" ${status === 'new' ? 'selected' : ''}>${t('admin.statusNew')}</option>
          <option value="answered" ${status === 'answered' ? 'selected' : ''}>${t('admin.statusAnswered')}</option>
        </select>
      </div>
      <p class="muted small">${t('admin.from')}: ${escapeHtml(fromLabel)}</p>
      ${productLine}
      <div>
        <p class="muted small">${t('admin.questionText')}</p>
        <p class="admin-question-message">${escapeHtml(msg.message || '—')}</p>
      </div>
      <div class="admin-question-answer">
        <label class="muted small" for="answer-${msg.id}">${t('admin.reply')}</label>
        <textarea id="answer-${msg.id}" class="question-answer-input" data-id="${msg.id}" placeholder="${t('admin.replyPlaceholder')}">${escapeHtml(msg.answer || '')}</textarea>
      </div>
      <div class="admin-question-actions">
        <button type="button" class="btn primary small-btn answer-question" data-id="${msg.id}">${t('admin.sendReply')}</button>
      </div>
    `;
    wrap.appendChild(card);
  });
};

const renderAdminReviews = () => {
  if (document.body.dataset.page !== 'admin') return;
  const wrap = document.getElementById('admin-reviews');
  if (!wrap) return;
  wrap.innerHTML = '';
  if (!reviews.length) {
    wrap.innerHTML = `<p class="muted">${t('admin.noReviews')}</p>`;
    return;
  }
  reviews.forEach((review) => {
    const product = products.find((item) => idsEqual(item.id, review.product_id));
    const card = document.createElement('article');
    card.className = 'admin-review-card';
    card.innerHTML = `
      <div class="admin-review-head">
        <div>
          <strong>${escapeHtml(review.user_name || review.user_email || 'Customer')}</strong>
          <p class="muted small">${escapeHtml(product?.name || `${t('common.product')} #${review.product_id}`)}</p>
          <p class="muted small">${formatDateTime(review.created_at)}</p>
        </div>
        <div class="admin-review-meta">
          <span class="review-rating-badge">${Number(review.rating || 0).toFixed(1)} ★</span>
          <span class="status-pill">${review.status}</span>
        </div>
      </div>
      <p class="admin-review-comment">${escapeHtml(review.comment || '—')}</p>
      <div class="admin-review-actions">
        <button class="btn ghost small-btn approve-review" type="button" data-id="${review.id}" data-product-id="${review.product_id}">${t('admin.reviewApprove')}</button>
        <button class="btn ghost small-btn reject-review" type="button" data-id="${review.id}" data-product-id="${review.product_id}">${t('admin.reviewReject')}</button>
        <button class="btn ghost small-btn delete-review" type="button" data-id="${review.id}" data-product-id="${review.product_id}">${t('admin.reviewDelete')}</button>
      </div>
    `;
    wrap.appendChild(card);
  });
};

const loadAllReviews = async () => {
  if (!window.db?.fetchReviewsDb) return [];
  try {
    return await window.db.fetchReviewsDb();
  } catch (error) {
    console.error('Failed to load reviews', error);
    return [];
  }
};

const handleAdminPage = async () => {
  if (document.body.dataset.page !== 'admin') return;
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  const role = await getUserRole();
  if (role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('product-form');
  const msg = document.getElementById('prod-msg');
  const nameEl = document.getElementById('prod-name');
  const priceEl = document.getElementById('prod-price');
  const imageEl = document.getElementById('prod-image');
  const descEl = document.getElementById('prod-desc');
  const idEl = document.getElementById('prod-id');
  const modelUrlEl = document.getElementById('prod-model-url');
  const show3dEl = document.getElementById('prod-show-3d');
  const imagePreview = document.getElementById('prod-image-preview');
  const imageDrop = document.getElementById('prod-image-drop');
  const imageFileInput = document.getElementById('prod-image-file');
  const galleryPreview = document.getElementById('prod-gallery-preview');
  const galleryDrop = document.getElementById('prod-gallery-drop');
  const galleryFileInput = document.getElementById('prod-gallery-file');
  const specsList = document.getElementById('prod-specs-list');
  const addSpecBtn = document.getElementById('add-spec-row');
  const baseRegionEl = document.getElementById('prod-base-region');
  const autoFillRegionalBtn = document.getElementById('autofill-region-prices');
  const list = document.getElementById('admin-products');
  const ordersWrap = document.getElementById('admin-orders');
  const questionsWrap = document.getElementById('admin-questions');
  const reviewsWrap = document.getElementById('admin-reviews');
  setupAdminProductFormTabs();
  const regionalPriceInputs = Object.fromEntries(
    REGION_ORDER.map((region) => [region, document.getElementById(`price-${region}`)])
  );

  const escapeAttr = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const createSpecRow = (spec = {}) => {
    const row = document.createElement('div');
    row.className = 'spec-editor-row';
    row.innerHTML = `
      <input class="spec-name-input" type="text" placeholder="${escapeAttr(t('admin.specName'))}" value="${escapeAttr(spec.name || '')}">
      <input class="spec-value-input" type="text" placeholder="${escapeAttr(t('admin.specValue'))}" value="${escapeAttr(spec.value || '')}">
      <button type="button" class="btn ghost small-btn spec-remove" aria-label="${t('admin.removeSpec')}">×</button>
    `;
    return row;
  };

  const getEditorSpecs = () =>
    Array.from(specsList?.querySelectorAll('.spec-editor-row') || [])
      .map((row) => ({
        name: row.querySelector('.spec-name-input')?.value || '',
        value: row.querySelector('.spec-value-input')?.value || ''
      }))
      .map((spec) => ({ name: spec.name.trim(), value: spec.value.trim() }))
      .filter((spec) => spec.name && spec.value);

  const fillEditorSpecs = (items = []) => {
    if (!specsList) return;
    specsList.innerHTML = '';
    const normalized = normalizeSpecs(items);
    if (!normalized.length) {
      specsList.appendChild(createSpecRow());
      return;
    }
    normalized.forEach((spec) => specsList.appendChild(createSpecRow(spec)));
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('File read failed'));
      reader.readAsDataURL(file);
    });

  const renderMainImagePreview = (url = '') => {
    if (!imagePreview) return;
    if (!url) {
      imagePreview.innerHTML = '';
      imagePreview.classList.add('hidden');
      return;
    }
    imagePreview.innerHTML = `<img src="${url}" alt="Product preview">`;
    imagePreview.classList.remove('hidden');
  };

  const renderGalleryPreview = (items = []) => {
    if (!galleryPreview) return;
    const urls = (Array.isArray(items) ? items : [])
      .map((item) => String(item || '').trim())
      .filter(Boolean);
    if (!urls.length) {
      galleryPreview.innerHTML = '';
      galleryPreview.classList.add('hidden');
      return;
    }
    galleryPreview.innerHTML = urls.map((url) => `<img src="${url}" alt="Gallery preview">`).join('');
    galleryPreview.classList.remove('hidden');
  };

  const highlightDropZone = (zone, active) => {
    if (!zone) return;
    zone.classList.toggle('is-dragover', !!active);
  };

  const getRegionalPricingDraft = () => {
    const next = {};
    REGION_ORDER.forEach((region) => {
      const raw = regionalPriceInputs[region]?.value;
      const amount = Number(raw);
      if (Number.isFinite(amount) && amount > 0) next[region] = amount;
    });
    return next;
  };

  const fillRegionalPricingInputs = (prices = {}) => {
    const normalized = parseRegionalPrices(prices);
    REGION_ORDER.forEach((region) => {
      const input = regionalPriceInputs[region];
      if (!input) return;
      input.value = normalized[region] ? String(normalized[region]) : '';
    });
  };

  const autoFillRegionalPrices = () => {
    const basePrice = Number(priceEl?.value || 0);
    const baseRegion = normalizePricingRegion(baseRegionEl?.value || 'eurasia');
    if (!Number.isFinite(basePrice) || basePrice <= 0) return;
    const next = {};
    REGION_ORDER.forEach((region) => {
      next[region] = region === baseRegion ? basePrice : convertRegionalBasePrice(basePrice, baseRegion, region);
    });
    fillRegionalPricingInputs(next);
  };

  const syncImageFieldPreview = () => {
    renderMainImagePreview(imageEl?.value.trim() || '');
  };

  const syncGalleryFieldPreview = () => {
    const galleryItems = parseGalleryInput(document.getElementById('prod-gallery')?.value || '');
    renderGalleryPreview(galleryItems);
  };

  const applyMainImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const dataUrl = await fileToDataUrl(file);
    if (imageEl) imageEl.value = dataUrl;
    syncImageFieldPreview();
  };

  const applyGalleryFiles = async (files = []) => {
    const validFiles = Array.from(files).filter((file) => file?.type?.startsWith('image/'));
    if (!validFiles.length) return;
    const dataUrls = await Promise.all(validFiles.map(fileToDataUrl));
    const galleryEl = document.getElementById('prod-gallery');
    const existing = parseGalleryInput(galleryEl?.value || '');
    const next = [...existing, ...dataUrls];
    if (galleryEl) galleryEl.value = next.join('\n');
    renderGalleryPreview(next);
  };

  const bindDropZone = ({ zone, input, multiple = false, onFiles }) => {
    if (!zone || !input || !onFiles) return;

    zone.addEventListener('click', () => input.click());
    zone.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      input.click();
    });

    input.addEventListener('change', async () => {
      const files = Array.from(input.files || []);
      if (!files.length) return;
      await onFiles(multiple ? files : [files[0]]);
      input.value = '';
    });

    ['dragenter', 'dragover'].forEach((eventName) => {
      zone.addEventListener(eventName, (e) => {
        e.preventDefault();
        highlightDropZone(zone, true);
      });
    });

    ['dragleave', 'dragend', 'drop'].forEach((eventName) => {
      zone.addEventListener(eventName, (e) => {
        e.preventDefault();
        highlightDropZone(zone, false);
      });
    });

    zone.addEventListener('drop', async (e) => {
      const files = Array.from(e.dataTransfer?.files || []);
      if (!files.length) return;
      await onFiles(multiple ? files : [files[0]]);
    });
  };

  const resetForm = () => {
    idEl.value = '';
    form?.reset();
    if (baseRegionEl) baseRegionEl.value = 'eurasia';
    fillRegionalPricingInputs({});
    fillEditorSpecs([]);
    renderMainImagePreview('');
    renderGalleryPreview([]);
  };

  addSpecBtn?.addEventListener('click', () => {
    specsList?.appendChild(createSpecRow());
  });

  specsList?.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.spec-remove');
    if (!removeBtn) return;
    const rows = specsList.querySelectorAll('.spec-editor-row');
    if (rows.length <= 1) {
      const nameInput = rows[0]?.querySelector('.spec-name-input');
      const valueInput = rows[0]?.querySelector('.spec-value-input');
      if (nameInput) nameInput.value = '';
      if (valueInput) valueInput.value = '';
      return;
    }
    removeBtn.closest('.spec-editor-row')?.remove();
  });

  fillEditorSpecs([]);
  bindDropZone({
    zone: imageDrop,
    input: imageFileInput,
    onFiles: async (files) => {
      await applyMainImageFile(files[0]);
    }
  });
  bindDropZone({
    zone: galleryDrop,
    input: galleryFileInput,
    multiple: true,
    onFiles: applyGalleryFiles
  });
  imageEl?.addEventListener('input', syncImageFieldPreview);
  document.getElementById('prod-gallery')?.addEventListener('input', syncGalleryFieldPreview);
  autoFillRegionalBtn?.addEventListener('click', autoFillRegionalPrices);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameEl.value.trim();
    const price = parseFloat(priceEl.value);
    const image = imageEl.value.trim();
    const desc = descEl.value.trim();
    const country = document.getElementById('prod-country')?.value.trim() || '';
    const size = document.getElementById('prod-size')?.value.trim() || '';
    const category = document.getElementById('prod-category')?.value.trim() || t('common.general');
    const qty = Number(document.getElementById('prod-qty')?.value || 0);
    const base_pricing_region = normalizePricingRegion(baseRegionEl?.value || 'eurasia');
    const regional_prices = getRegionalPricingDraft();
    const age_rating = document.getElementById('prod-age-rating')?.value.trim() || '';
    const materials = normalizeSafetyList(document.getElementById('prod-materials')?.value || '');
    const certifications = normalizeSafetyList(document.getElementById('prod-certifications')?.value || '');
    const safety_warnings = document.getElementById('prod-safety-warnings')?.value.trim() || '';
    const color = document.getElementById('prod-color')?.value.trim() || '';
    const model_url = modelUrlEl?.value.trim() || '';
    const show_3d = Boolean(show3dEl?.checked && model_url);
    const galleryRaw = document.getElementById('prod-gallery')?.value || '';
    const gallery_images = parseGalleryInput(galleryRaw);
    const tagsRaw = document.getElementById('prod-tags')?.value || '';
    const tags = tagsRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const specs = getEditorSpecs();
    if (!name || Number.isNaN(price)) {
      if (msg) msg.textContent = t('admin.enterNamePrice');
      return;
    }
    const isEdit = !!idEl.value;
    const editId = isEdit ? (Number.isFinite(Number(idEl.value)) ? Number(idEl.value) : normalizeId(idEl.value)) : null;
    const productPayload = {
      name,
      price,
      description: desc,
      image_url: image,
      country,
      size,
      category,
      color,
      base_pricing_region,
      regional_prices,
      age_rating,
      materials,
      certifications,
      safety_warnings,
      model_url,
      show_3d,
      gallery_images,
      quantity: qty,
      tags
    };
    try {
      let savedId = editId;
      if (window.db?.supabaseClient) {
        const payload = {
          name: productPayload.name,
          price: productPayload.price,
          description: productPayload.description,
          image_url: productPayload.image_url,
          gallery_images: productPayload.gallery_images,
          color: productPayload.color,
          model_url: productPayload.model_url,
          show_3d: productPayload.show_3d,
          country: productPayload.country,
          size: productPayload.size,
          category: productPayload.category,
          quantity: productPayload.quantity,
          base_pricing_region: productPayload.base_pricing_region,
          regional_prices: productPayload.regional_prices,
          age_rating: productPayload.age_rating,
          materials: productPayload.materials,
          certifications: productPayload.certifications,
          safety_warnings: productPayload.safety_warnings,
          tags: productPayload.tags
        };

        if (isEdit) {
          const { data, error } = await window.db.supabaseClient
            .from('products')
            .update(payload)
            .eq('id', editId)
            .select('id');
          console.log('SUPABASE RESPONSE:', data);
          console.log('SUPABASE ERROR:', error);
          if (error) throw error;
          if (!data || !data.length) {
            throw new Error('No rows updated. Check product id or Supabase RLS policy for UPDATE.');
          }
          savedId = data[0]?.id ?? editId;
        } else {
          const { data, error } = await window.db.supabaseClient
            .from('products')
            .insert(payload)
            .select('id');
          console.log('SUPABASE RESPONSE:', data);
          console.log('SUPABASE ERROR:', error);
          if (error) throw error;
          if (!data || !data.length) {
            throw new Error('No rows inserted. Check Supabase RLS policy for INSERT.');
          }
          savedId = data[0]?.id;
        }
      }
      if (savedId != null && savedId !== '') {
        setStoredProductSpecs(savedId, specs);
      }
      products = await loadProducts();
      renderAdminProducts();
      resetForm();
      if (msg) msg.textContent = t('admin.saveSuccess');
    } catch (err) {
      if (msg) msg.textContent = `Save failed: ${err.message || err}`;
      console.error(err);
    }
  });

  list?.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.edit-prod');
    const delBtn = e.target.closest('.delete-prod');
    if (editBtn) {
      const id = normalizeId(editBtn.dataset.id);
      const prod = products.find((p) => idsEqual(p.id, id));
      if (prod) {
        idEl.value = prod.id;
        nameEl.value = prod.name;
        priceEl.value = prod.price;
        imageEl.value = prod.image;
        descEl.value = prod.desc || '';
        const tagsEl = document.getElementById('prod-tags');
        const countryEl = document.getElementById('prod-country');
        const sizeEl = document.getElementById('prod-size');
        const categoryEl = document.getElementById('prod-category');
        const qtyEl = document.getElementById('prod-qty');
        const basePricingRegionEl = document.getElementById('prod-base-region');
        const ageRatingEl = document.getElementById('prod-age-rating');
        const materialsEl = document.getElementById('prod-materials');
        const certificationsEl = document.getElementById('prod-certifications');
        const warningsEl = document.getElementById('prod-safety-warnings');
        const colorEl = document.getElementById('prod-color');
        const galleryEl = document.getElementById('prod-gallery');
        const modelFieldEl = document.getElementById('prod-model-url');
        const show3dFieldEl = document.getElementById('prod-show-3d');
        if (countryEl) countryEl.value = prod.country || '';
        if (sizeEl) sizeEl.value = prod.size || '';
        if (categoryEl) categoryEl.value = prod.category || '';
        if (qtyEl) qtyEl.value = Number.isFinite(prod.quantity) ? prod.quantity : '';
        if (basePricingRegionEl) basePricingRegionEl.value = normalizePricingRegion(prod.base_pricing_region || 'eurasia');
        fillRegionalPricingInputs(prod.regional_prices || {});
        if (ageRatingEl) ageRatingEl.value = prod.age_rating || '';
        if (materialsEl) materialsEl.value = normalizeSafetyList(prod.materials).join(', ');
        if (certificationsEl) certificationsEl.value = normalizeSafetyList(prod.certifications).join(', ');
        if (warningsEl) warningsEl.value = prod.safety_warnings || '';
        if (colorEl) colorEl.value = prod.color || '';
        if (galleryEl) galleryEl.value = Array.isArray(prod.gallery_images) ? prod.gallery_images.join('\n') : '';
        if (modelFieldEl) modelFieldEl.value = prod.model_url || '';
        if (show3dFieldEl) show3dFieldEl.checked = Boolean(prod.show_3d && prod.model_url);
        if (tagsEl) tagsEl.value = Array.isArray(prod.tags) ? prod.tags.join(', ') : '';
        renderMainImagePreview(prod.image || '');
        renderGalleryPreview(Array.isArray(prod.gallery_images) ? prod.gallery_images : []);
        fillEditorSpecs(getStoredProductSpecs(prod.id));
      }
    }
    if (delBtn) {
      const id = normalizeId(delBtn.dataset.id);
      try {
        if (window.db?.deleteProductDb) await window.db.deleteProductDb(id);
        setStoredProductSpecs(id, []);
        products = products.filter((p) => !idsEqual(p.id, id));
        await loadProducts();
        renderAdminProducts();
      } catch (err) {
        console.error(err);
      }
    }
  });

  ordersWrap?.addEventListener('change', (e) => {
    const select = e.target.closest('.order-status-select');
    if (!select) return;
    const orderId = select.dataset.orderId;
    const nextStatus = select.value;
    (async () => {
      try {
        const data = window.db?.updateOrderStatusDb ? await window.db.updateOrderStatusDb(orderId, nextStatus) : [];
        console.log('SUPABASE RESPONSE:', data);
        console.log('SUPABASE ERROR:', null);
        orders = await loadOrders();
        renderAdminOrders();
      } catch (error) {
        console.log('SUPABASE RESPONSE:', null);
        console.log('SUPABASE ERROR:', error);
        console.error(error);
      }
    })();
  });

  questionsWrap?.addEventListener('click', (e) => {
    const answerBtn = e.target.closest('.answer-question');
    if (!answerBtn) return;
    const id = normalizeId(answerBtn.dataset.id);
    const answerInput = questionsWrap.querySelector(`.question-answer-input[data-id="${id}"]`);
    const statusSelect = questionsWrap.querySelector(`.question-status-select[data-id="${id}"]`);
    const answer = (answerInput?.value || '').trim();
    const status = statusSelect?.value === 'answered' ? 'answered' : 'new';
    (async () => {
      try {
        await answerSupportMessage(id, answer, status);
        supportMessages = await loadSupportMessages();
        renderAdminQuestions();
        showToast(t('admin.savedAnswer'));
      } catch (error) {
        console.log('SUPABASE RESPONSE:', null);
        console.log('SUPABASE ERROR:', error);
        console.error(error);
      }
    })();
  });

  reviewsWrap?.addEventListener('click', (e) => {
    const approveBtn = e.target.closest('.approve-review');
    const rejectBtn = e.target.closest('.reject-review');
    const deleteBtn = e.target.closest('.delete-review');
    if (!approveBtn && !rejectBtn && !deleteBtn) return;
    const reviewId = normalizeId((approveBtn || rejectBtn || deleteBtn)?.dataset.id);
    const productId = normalizeId((approveBtn || rejectBtn || deleteBtn)?.dataset.productId);
    (async () => {
      try {
        if (approveBtn && window.db?.updateReviewDb) {
          await window.db.updateReviewDb(reviewId, { status: 'approved' });
        }
        if (rejectBtn && window.db?.updateReviewDb) {
          await window.db.updateReviewDb(reviewId, { status: 'rejected' });
        }
        if (deleteBtn && window.db?.deleteReviewDb) {
          await window.db.deleteReviewDb(reviewId);
        }
        if (window.db?.recalculateProductRatingDb && productId) {
          const updatedProduct = await window.db.recalculateProductRatingDb(productId);
          if (updatedProduct) {
            const index = products.findIndex((item) => idsEqual(item.id, updatedProduct.id));
            if (index >= 0) products[index] = updatedProduct;
          }
        }
        reviews = await loadAllReviews();
        renderAdminReviews();
      } catch (error) {
        console.log('SUPABASE RESPONSE:', null);
        console.log('SUPABASE ERROR:', error);
        console.error(error);
      }
    })();
  });

  const tabs = Array.from(document.querySelectorAll('[data-admin-tab]'));
  const productsPanel = document.getElementById('admin-tab-products');
  const ordersPanel = document.getElementById('admin-tab-orders');
  const questionsPanel = document.getElementById('admin-tab-questions');
  const reviewsPanel = document.getElementById('admin-tab-reviews');
  const setAdminTab = (tab) => {
    tabs.forEach((btn) => btn.classList.toggle('active', btn.dataset.adminTab === tab));
    productsPanel?.classList.toggle('hidden', tab !== 'products');
    ordersPanel?.classList.toggle('hidden', tab !== 'orders');
    questionsPanel?.classList.toggle('hidden', tab !== 'questions');
    reviewsPanel?.classList.toggle('hidden', tab !== 'reviews');
  };
  tabs.forEach((btn) => btn.addEventListener('click', () => setAdminTab(btn.dataset.adminTab)));
  setAdminTab('products');

  (async () => {
    orders = await loadOrders();
    renderAdminOrders();
    supportMessages = await loadSupportMessages();
    renderAdminQuestions();
    reviews = await loadAllReviews();
    renderAdminReviews();
  })();
  renderAdminProducts();
};

const renderRecommended = () => {
  if (document.body.dataset.page !== 'cart') return;
  const grid = document.getElementById('recommended-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const pool = [...products];
  const picks = [];
  const target = Math.min(6, pool.length);
  while (picks.length < target && pool.length) {
    const idx = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(idx, 1)[0]);
  }
  picks.forEach((p) => {
    const card = createCard(p);
    grid.appendChild(card);
  });
};

const renderWishlistPage = async () => {
  if (document.body.dataset.page !== 'wishlist') return;
  const grid = document.getElementById('wishlist-grid');
  const empty = document.getElementById('wishlist-empty');
  const countEl = document.getElementById('wishlist-count-text');
  if (!grid || !empty) return;
  await syncFavoritesFromRemote();
  const favoriteIds = getFavorites();
  if (countEl) countEl.textContent = `${favoriteIds.length}`;
  if (!favoriteIds.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  await ensureProducts(favoriteIds);
  const favoriteProducts = favoriteIds
    .map((id) => products.find((product) => idsEqual(product.id, id)))
    .filter(Boolean);
  grid.innerHTML = '';
  favoriteProducts.forEach((product) => {
    grid.appendChild(createCollectionCard(product));
  });
  refreshFavoriteControls();
};

const applyTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.innerHTML = theme === 'dark' ? THEME_ICONS.light : THEME_ICONS.dark;
    toggle.setAttribute('aria-label', theme === 'dark' ? t('nav.switchToLight') : t('nav.switchToDark'));
  }
};

const initTheme = () => {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(saved);
  const toggle = document.getElementById('theme-toggle');
  toggle?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
};

const handleRegister = () => {
  if (document.body.dataset.page !== 'register') return;
  const form = document.getElementById('register-form');
  const err = document.getElementById('register-error');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      err.textContent = t('auth.validEmail');
      return;
    }
    if (password.length < 6) {
      err.textContent = t('auth.passwordMin');
      return;
    }
    try {
      const fullName = email.includes('@') ? email.split('@')[0] : email;
      const data = window.db?.signUpAuth ? await window.db.signUpAuth(email, password, { full_name: fullName }) : null;
      console.log('SUPABASE RESPONSE:', data);
      console.log('SUPABASE ERROR:', null);
      const needsEmailConfirmation = !data?.session;
      err.textContent = needsEmailConfirmation ? t('auth.confirmEmailNotice') : '';
      if (needsEmailConfirmation) {
        setTimeout(() => {
          window.location.href = 'login.html?registered=1';
        }, 1600);
      } else {
        window.location.href = 'login.html?registered=1';
      }
    } catch (error) {
      console.log('SUPABASE RESPONSE:', null);
      console.log('SUPABASE ERROR:', error);
      const msg = String(error?.message || '');
      if (/database error saving new user/i.test(msg)) {
        err.textContent = t('auth.databaseSaveError');
      } else {
        err.textContent = error?.message || t('auth.accountExists');
      }
    }
  });
};

const handleLogin = () => {
  if (document.body.dataset.page !== 'login') return;
  const form = document.getElementById('login-form');
  const err = document.getElementById('login-error');
  const params = new URLSearchParams(window.location.search);
  if (params.get('registered')) {
    const msg = document.getElementById('login-success');
    if (msg) msg.textContent = t('auth.registrationSuccess');
  }
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    try {
      const data = window.db?.signInAuth ? await window.db.signInAuth(email, password) : null;
      console.log('SUPABASE RESPONSE:', data);
      console.log('SUPABASE ERROR:', null);
      const user = data?.user || data?.session?.user || null;
      if (!user) {
        err.textContent = t('auth.invalidCredentials');
        return;
      }
      setCurrentUser(user);
      err.textContent = '';
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || 'index.html';
      window.location.href = redirect;
    } catch (error) {
      console.log('SUPABASE RESPONSE:', null);
      console.log('SUPABASE ERROR:', error);
      err.textContent = error?.message || t('auth.invalidCredentials');
    }
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  initLanguage();
  initCurrency();
  initTheme();
  setupNavSettings();
  const authReady = initAuth().catch((error) => {
    console.warn('Auth init failed, continuing in guest mode:', error);
    setCurrentUser(null);
    setCurrentUserRole(null);
    return null;
  });
  await bootstrapProductsForPage();

  const page = document.body.dataset.page || '';

  if (page === 'home') {
    renderPopular();
  }

  if (page === 'products') {
    wireProductsPage();
  }

  if (page === 'wishlist') {
    await authReady;
    await renderWishlistPage();
  }

  if (page === 'cart') {
    await authReady;
    await renderCartPage();
    setTimeout(async () => {
      try {
        if (!products.length) {
          await loadProducts();
        }
        renderRecommended();
      } catch (error) {
        console.error('Recommended products load failed', error);
      }
    }, 0);
  }

  if (page === 'checkout') {
    await authReady;
    await renderCheckout();
  }

  if (page === 'product') {
    setupProductDetailTabs();
    await renderProductPage();
  }

  if (page === 'profile') {
    await authReady;
    await renderProfile();
  }

  if (page === 'admin') {
    await authReady;
    await handleAdminPage();
  }

  wireCartEvents();
  wireBackButtons();
  wireSupportLinks();
  updateCartCount();
  updateWishlistCount();
  refreshFavoriteControls();
  handleRegister();
  handleLogin();
});










