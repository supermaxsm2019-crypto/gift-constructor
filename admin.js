/**
 * Панель керування каталогом подарунків (Admin Panel)
 * 
 * Можливості:
 * 1. Повний CRUD: Додавання, перегляд, редагування та видалення подарунків.
 * 2. Повна синхронізація та збереження у LocalStorage при закритті/перезавантаженні сторінки.
 * 3. Автоматичне збереження чернетки (Draft auto-save), щоб введений текст не втрачався при випадковому оновленні.
 * 4. Збереження стану фільтрів, сортування та обраного вигляду (таблиця/сітка).
 * 5. Живе прев'ю картки в реальному часі під час створення/редагування.
 * 6. Експорт та імпорт каталогу у форматі JSON.
 * 7. Надійне скидання до стандартного каталогу (вбудована база 23 подарунків, що працює офлайн і по file:// без CORS).
 */

document.addEventListener('DOMContentLoaded', () => {
	// ==========================================
	// 1. КОНСТАНТИ ТА КЛЮЧІ СХОВИЩА LOCALSTORAGE
	// ==========================================
	const STORAGE_KEY = 'gift_constructor_catalog';
	const FILTERS_KEY = 'gift_admin_filters';
	const DRAFT_KEY = 'gift_admin_form_draft';
	const VIEW_MODE_KEY = 'gift_admin_view_mode';

	// Словник назв подій
	const occasionLabels = {
		"ДН": "День Народження",
		"НР": "Новий Рік",
		"8Б": "8 Березня",
		"Весілля": "Весілля",
		"Всі": "Будь-яка подія"
	};

	// Фото-заглушка за замовчуванням
	const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80";

	// Вбудована повна база 23 подарунків (синхронізована з gifts.json для безвідмовної роботи без мережевих запитів)
	const DEFAULT_GIFTS_CATALOG = [
		{
			id: "mini-gingerbread",
			tier: "mini",
			budgetMin: 50,
			budgetMax: 300,
			recipient: "Всі",
			occasion: "НР",
			badge: "Дрібничка до свята",
			title: "Святковий медово-імбирний пряник ручної роботи",
			description: "Ніжний розписний імбирний пряник із додаванням натурального меду, кориці та гвоздики. Упакований у прозорий святковий пакетик із джутовим бантиком.",
			items: [
				{ name: "Імбирний пряник ручного розпису глазур'ю (100 г)", estCost: 70 },
				{ name: "Святковий крафтовий пакетик із джутовим шнурком", estCost: 20 }
			],
			price: 90,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1543255006-d6395b6f1171?w=600&q=80",
			availability: "В наявності",
			rating: 4.9
		},
		{
			id: "mini-card-tea",
			tier: "mini",
			budgetMin: 50,
			budgetMax: 300,
			recipient: "Мама",
			occasion: "8Б",
			badge: "Теплий комплімент",
			title: "Крафтова авторська листівка & Саше карпатського чаю",
			description: "Зворушливий бюджетний комплімент: дизайнерська листівка з весняними квітами для особистих слів і саше запашного карпатського трав'яного чаю з мелісою та м'ятою.",
			items: [
				{ name: "Дизайнерська листівка ручної роботи з конвертом", estCost: 55 },
				{ name: "Порційне крафтове саше трав'яного чаю (25 г)", estCost: 40 }
			],
			price: 95,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&q=80",
			availability: "В наявності",
			rating: 4.8
		},
		{
			id: "mini-chocolate-mama",
			tier: "mini",
			budgetMin: 50,
			budgetMax: 300,
			recipient: "Мама",
			occasion: "ДН",
			badge: "Солодкий комплімент",
			title: "Крафтова міні-плитка шоколаду з ягодами",
			description: "Натуральний темний бельгійський шоколад ручної роботи з сублімованою малиною та пелюстками волошок у крафтовій обгортці з міні-листівкою.",
			items: [
				{ name: "Плитка крафтового шоколаду з ягодами (80 г)", estCost: 80 },
				{ name: "Міні-листівка з теплими побажаннями", estCost: 20 }
			],
			price: 100,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=80",
			availability: "В наявності",
			rating: 4.9
		},
		{
			id: "mini-keychain-tato",
			tier: "mini",
			budgetMin: 50,
			budgetMax: 300,
			recipient: "Тато",
			occasion: "ДН",
			badge: "Корисна дрібничка",
			title: "Дерев'яний брелок із пам'ятним гравіюванням для Тата",
			description: "Міцний та приємний на дотик брелок із дуба зі сталевим кільцем та лазерним гравіюванням «Найкращий тато». Корисний щоденний аксесуар.",
			items: [
				{ name: "Брелок із натурального дуба зі сталевим кільцем", estCost: 75 },
				{ name: "Лазерне пам'ятне гравіювання", estCost: 25 }
			],
			price: 100,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&q=80",
			availability: "В наявності",
			rating: 4.8
		},
		{
			id: "mini-honey-tato-ny",
			tier: "mini",
			budgetMin: 50,
			budgetMax: 300,
			recipient: "Тато",
			occasion: "НР",
			badge: "Зимовий комплімент",
			title: "Міні-баночка гірського меду з волоським горіхом",
			description: "Смачна та корисна зимова дрібничка: баночка натурального меду з цільними волоськими горіхами, прикрашена крафтовою шапочкою та новорічною біркою.",
			items: [
				{ name: "Баночка натурального меду з горіхами (130 г)", estCost: 85 },
				{ name: "Крафтове оформлення з дерев'яною ложечкою", estCost: 25 }
			],
			price: 110,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80",
			availability: "В наявності",
			rating: 4.8
		},
		{
			id: "mini-mask-sestra",
			tier: "mini",
			budgetMin: 50,
			budgetMax: 300,
			recipient: "Сестра",
			occasion: "ДН",
			badge: "Beauty-комплімент",
			title: "Зволожуюча тканинна маска & Бальзам для губ",
			description: "Приємний б'юті-комплімент: зволожуюча корейська маска з екстрактом алое та натуральний гігієнічний бальзам для губ із кокосовою олією.",
			items: [
				{ name: "Тканинна зволожуюча маска для обличчя", estCost: 55 },
				{ name: "Натуральний бальзам для губ (кокос)", estCost: 45 }
			],
			price: 100,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
			availability: "В наявності",
			rating: 4.7
		},
		{
			id: "mini-stickers-brat",
			tier: "mini",
			budgetMin: 50,
			budgetMax: 300,
			recipient: "Брат",
			occasion: "ДН",
			badge: "Tech-дрібничка",
			title: "Стікерпак вінілових наліпок на ноутбук & Шоколадний батончик",
			description: "Набір стильних вологостійких вінілових наліпок для ноутбука чи телефона у стилі IT/Gaming та крафтовий шоколадний батончик із карамеллю.",
			items: [
				{ name: "Набір вінілових стікерів (15 шт.)", estCost: 60 },
				{ name: "Крафтовий шоколадно-горіховий батончик", estCost: 35 }
			],
			price: 95,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80",
			availability: "В наявності",
			rating: 4.8
		},
		{
			id: "standard-spa-mama",
			tier: "standard",
			budgetMin: 301,
			budgetMax: 900,
			recipient: "Мама",
			occasion: "ДН",
			badge: "Догляд",
			title: "Ароматична соєва свічка & Крем для рук з олією ши",
			description: "Базовий затишний набір: натуральна соєва свічка у скляній баночці з ароматом лаванди та поживний крем для рук із ніжним маслом ши.",
			items: [
				{ name: "Ароматична свічка із соєвого воску (120 мл)", estCost: 280 },
				{ name: "Крем для рук з олією ши та алое (75 мл)", estCost: 220 },
				{ name: "Крафтова подарункова коробочка зі стрічкою", estCost: 80 }
			],
			price: 580,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
			availability: "В наявності",
			rating: 4.9
		},
		{
			id: "standard-flowers-mama",
			tier: "standard",
			budgetMin: 301,
			budgetMax: 900,
			recipient: "Мама",
			occasion: "8Б",
			badge: "Весна",
			title: "Весняний букет тюльпанів & Листівка",
			description: "Свіжий весняний букет із 9 ніжних тюльпанів у крафтовому папері з атласною стрічкою та святковою листівкою з побажаннями.",
			items: [
				{ name: "Букет свіжих весняних тюльпанів (9 шт.)", estCost: 490 },
				{ name: "Крафтове флористичне пакування зі стрічкою", estCost: 60 },
				{ name: "Вітальна листівка", estCost: 30 }
			],
			price: 580,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&q=80",
			availability: "В наявності",
			rating: 4.8
		},
		{
			id: "standard-leather-tato",
			tier: "standard",
			budgetMin: 301,
			budgetMax: 900,
			recipient: "Тато",
			occasion: "ДН",
			badge: "Аксесуар",
			title: "Шкіряний кардхолдер ручної роботи Crazy Horse",
			description: "Компактний та тонкий гаманець для карток і купюр із натуральної шкіри Crazy Horse. Зручно носити в кишені без зайвого об'єму.",
			items: [
				{ name: "Шкіряний кардхолдер на 6 відділень", estCost: 480 },
				{ name: "Крафтова подарункова коробочка з наповнювачем", estCost: 70 }
			],
			price: 550,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
			availability: "В наявності",
			rating: 4.9
		},
		{
			id: "standard-coffee-tato",
			tier: "standard",
			budgetMin: 301,
			budgetMax: 900,
			recipient: "Тато",
			occasion: "8Б",
			badge: "Кава",
			title: "Зернова фермерська кава Specialty & Шоколад",
			description: "Пачка свіжообсмаженої фермерської Арабіки (Колумбія) з нотами карамелі та горіхів у парі з плиткою гірського екстрачорного шоколаду.",
			items: [
				{ name: "Свіжообсмажена кава в зернах Specialty (250 г)", estCost: 320 },
				{ name: "Плитка крафтового шоколаду 75% какао", estCost: 160 },
				{ name: "Подарунковий паперовий пакет", estCost: 40 }
			],
			price: 520,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80",
			availability: "В наявності",
			rating: 4.8
		},
		{
			id: "optimal-spa-mama",
			tier: "optimal",
			budgetMin: 901,
			budgetMax: 2400,
			recipient: "Мама",
			occasion: "ДН",
			badge: "СПА & Догляд",
			title: "СПА-набір релаксу та органічного догляду",
			description: "Повноцінний подарунковий бокс преміум-догляду в крафтовій дерев'яній коробці. Включає натуральну косметику ручної роботи, соєву ароматичну свічку та заспокійливий карпатський трав'яний чай.",
			items: [
				{ name: "Ароматична свічка із натурального соєвого воску", estCost: 350 },
				{ name: "Крем-баттер для тіла з олією ши та лавандою", estCost: 420 },
				{ name: "Крафтове мило ручної роботи з вівсяним молочком", estCost: 160 },
				{ name: "Збір органічного карпатського трав'яного чаю (100 г)", estCost: 170 },
				{ name: "Дерев'яна подарункова коробка зі святковою стрічкою", estCost: 250 }
			],
			price: 1350,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
			availability: "В наявності",
			rating: 5.0
		},
		{
			id: "optimal-cozy-ny",
			tier: "optimal",
			budgetMin: 901,
			budgetMax: 2400,
			recipient: "Мама",
			occasion: "НР",
			badge: "Зимовий затишок",
			title: "Новорічний затишний набір із вовняним пледом",
			description: "Теплий та душевний зимовий бокс: плед із натуральної вовни (140x200 см), різдвяний крем-мед з горіхами, керамічна авторська чашка та свічка з ароматом кориці й апельсина.",
			items: [
				{ name: "М'який плед із натуральної вовни", estCost: 890 },
				{ name: "Керамічна кружка ручної роботи", estCost: 280 },
				{ name: "Баночка крем-меду з мигдалем (250 г)", estCost: 190 },
				{ name: "Крафтова свічка «Кориця & Апельсин»", estCost: 210 },
				{ name: "Фірмовий новорічний крафт-бокс", estCost: 180 }
			],
			price: 1750,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80",
			availability: "В наявності",
			rating: 5.0
		},
		{
			id: "optimal-leather-tato",
			tier: "optimal",
			budgetMin: 901,
			budgetMax: 2400,
			recipient: "Тато",
			occasion: "ДН",
			badge: "Стиль",
			title: "Чоловічий набір: Шкіряний портмоне & Ремінь",
			description: "Стильний комплект аксесуарів із натуральної ремінної шкіри Crazy Horse у фірмовій дерев'яній коробці. З часом набуває благородної вінтажної патини.",
			items: [
				{ name: "Портмоне подвійного складання з натуральної шкіри", estCost: 750 },
				{ name: "Класичний шкіряний ремінь із масивною металевою пряжкою", estCost: 620 },
				{ name: "Дерев'яна подарункова коробка з персональним гравіюванням", estCost: 190 },
				{ name: "Бальзам-віск для догляду за шкірою", estCost: 90 }
			],
			price: 1650,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80",
			availability: "В наявності",
			rating: 4.9
		},
		{
			id: "optimal-thermos-tato",
			tier: "optimal",
			budgetMin: 901,
			budgetMax: 2400,
			recipient: "Тато",
			occasion: "НР",
			badge: "Затишок",
			title: "Зимовий термос-сет зі сталі & Вовняний шарф",
			description: "Вакуумний термос із подвійними стінками з харчової нержавіючої сталі 18/8 (тримає тепло 24 години) та теплий шарф із мериносової вовни в подарунковому боксі.",
			items: [
				{ name: "Вакуумний термос із нержавіючої сталі (750 мл)", estCost: 580 },
				{ name: "Шарф із натуральної мериносової вовни", estCost: 420 },
				{ name: "Карпатський чай та святкове пакування", estCost: 200 }
			],
			price: 1200,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=600&q=80",
			availability: "В наявності",
			rating: 4.8
		},
		{
			id: "optimal-coffee-tato",
			tier: "optimal",
			budgetMin: 901,
			budgetMax: 2400,
			recipient: "Тато",
			occasion: "8Б",
			badge: "Кавоман",
			title: "Набір поціновувача кави: Гейзерна кавоварка & Арабіка",
			description: "Класична гейзерна кавоварка на 3 порції, пачка свіжообсмаженої арабіки Specialty та стильна термокружка подвійної стінки з кришкою-клапаном.",
			items: [
				{ name: "Гейзерна кавоварка з харчового алюмінію", estCost: 640 },
				{ name: "Свіжообсмажена кава в зернах Specialty (250 г)", estCost: 320 },
				{ name: "Термокружка подвійної стінки (350 мл)", estCost: 360 },
				{ name: "Подарунковий тубус", estCost: 130 }
			],
			price: 1450,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80",
			availability: "В наявності",
			rating: 4.9
		},
		{
			id: "optimal-beauty-sestra",
			tier: "optimal",
			budgetMin: 901,
			budgetMax: 2400,
			recipient: "Сестра",
			occasion: "ДН",
			badge: "Beauty",
			title: "Б'юті-бокс трендової доглядової косметики",
			description: "Повний набір щоденного піклування про шкіру: зволожуюча сироватка з гіалуроновою кислотою, ензимна пудра, тканинні маски та дзеркало з LED-підсвіткою.",
			items: [
				{ name: "Зволожуюча сироватка з гіалуроновою кислотою", estCost: 410 },
				{ name: "Ензимна пудра для делікатного пілінгу", estCost: 320 },
				{ name: "Настільне косметичне дзеркало з LED-підсвіткою", estCost: 390 },
				{ name: "Набір корейських тканинних масок (5 шт.)", estCost: 180 },
				{ name: "Пастельний б'юті-бокс", estCost: 100 }
			],
			price: 1400,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
			availability: "В наявності",
			rating: 4.9
		},
		{
			id: "optimal-tech-brat",
			tier: "optimal",
			budgetMin: 901,
			budgetMax: 2400,
			recipient: "Брат",
			occasion: "ДН",
			badge: "Tech",
			title: "Геймерський & Tech-сет: Бездротова миша та павербанк",
			description: "Ергономічна бездротова миша з високим DPI, павербанк 20000 mAh зі швидкою зарядкою 22.5W та великий ігровий килимок розміру Speed.",
			items: [
				{ name: "Бездротова оптична миша з регулюванням DPI", estCost: 680 },
				{ name: "Павербанк 20000 mAh зі швидкою зарядкою 22.5W", estCost: 590 },
				{ name: "Ігровий килимок Speed (800x300 мм)", estCost: 280 }
			],
			price: 1550,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80",
			availability: "В наявності",
			rating: 4.9
		},
		{
			id: "optimal-hoodie-brat",
			tier: "optimal",
			budgetMin: 901,
			budgetMax: 2400,
			recipient: "Брат",
			occasion: "НР",
			badge: "Зима",
			title: "Теплий зимовий худі оверсайз & Bluetooth-навушники",
			description: "Бавовняна толстовка оверсайз на щільному флісі та бездротові накладні Bluetooth-навушники з автономністю до 30 годин.",
			items: [
				{ name: "Бавовняний худі оверсайз на тринитковому флісі", estCost: 1150 },
				{ name: "Бездротові накладні Bluetooth-навушники", estCost: 750 },
				{ name: "Пакування в урбан-стилі", estCost: 200 }
			],
			price: 2100,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80",
			availability: "В наявності",
			rating: 4.9
		},
		{
			id: "premium-silk-perfume",
			tier: "premium",
			budgetMin: 2500,
			budgetMax: 10000,
			recipient: "Сестра",
			occasion: "Весілля",
			badge: "Шик & Люкс",
			title: "Шовковий халат-кімоно & Нішевий вечірній парфум",
			description: "Розкішний набір найвищого ґатунку: халат-кімоно із 100% натурального шовку Mulberry з витонченим мереживом та флакон авторського нішевого парфуму (Eau de Parfum) з пудровими, ірисовими та сандаловими акордами.",
			items: [
				{ name: "Халат-кімоно із 100% натурального шовку Mulberry", estCost: 1850 },
				{ name: "Флакон авторського нішевого парфуму Eau de Parfum (50 мл)", estCost: 950 },
				{ name: "Преміальний футляр на магнітному замку з шовковою стрічкою", estCost: 100 }
			],
			price: 2900,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
			availability: "В наявності",
			rating: 5.0
		},
		{
			id: "premium-crystal-wine",
			tier: "premium",
			budgetMin: 2500,
			budgetMax: 10000,
			recipient: "Мама",
			occasion: "Весілля",
			badge: "Елегантність",
			title: "Елегантний сет: Кришталевий декантер & Келихи для вина",
			description: "Вишуканий набір із високоякісного богемського кришталю ручної огранки. Включає масивний аераційний декантер та пару келихів у розкішному оксамитовому ложементі.",
			items: [
				{ name: "Аераційний декантер із богемського кришталю (1.2 л)", estCost: 1350 },
				{ name: "Пара кришталевих келихів для вина з тонкою ніжкою", estCost: 850 },
				{ name: "Оксамитовий подарунковий презентаційний кейс", estCost: 400 }
			],
			price: 2600,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80",
			availability: "В наявності",
			rating: 5.0
		},
		{
			id: "premium-watch-tato",
			tier: "premium",
			budgetMin: 2500,
			budgetMax: 10000,
			recipient: "Тато",
			occasion: "Весілля",
			badge: "Преміум",
			title: "Класичний наручний годинник із сапфіровим склом & Гравіювання",
			description: "Елітний чоловічий годинник у корпусі з хірургічної сталі 316L, сапфіровим стійким до подряпин склом, ремінцем із натуральної телячої шкіри та пам'ятним ювелірним гравіюванням у лакованому футлярі з червоного дерева.",
			items: [
				{ name: "Швейцарсько-японський кварцовий годинник із сапфіровим склом", estCost: 2900 },
				{ name: "Індивідуальне алмазне гравіювання пам'ятних слів", estCost: 350 },
				{ name: "Футляр із полірованого червоного дерева з оксамитовою подушкою", estCost: 450 },
				{ name: "Сертифікат якості та міжнародна гарантія", estCost: 100 }
			],
			price: 3800,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80",
			availability: "В наявності",
			rating: 5.0
		},
		{
			id: "premium-cufflinks-brat",
			tier: "premium",
			budgetMin: 2500,
			budgetMax: 10000,
			recipient: "Брат",
			occasion: "Весілля",
			badge: "Преміум",
			title: "Срібні запонки 925 проби & Елітний годинник",
			description: "Статусний весільний комплект: авторські ювелірні запонки зі стерлінгового срібла 925 проби та тонкий класичний наручний годинник у велюровому футлярі.",
			items: [
				{ name: "Срібні запонки 925 проби ручної роботи", estCost: 1100 },
				{ name: "Класичний годинник у надтонкому сталевому корпусі", estCost: 1850 },
				{ name: "Дерев'яний футляр із велюровою оббивкою", estCost: 450 }
			],
			price: 3400,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80",
			availability: "В наявності",
			rating: 5.0
		}
	];

	// ==========================================
	// 2. СТАН ДОДАТКА
	// ==========================================
	let catalog = [];
	let filteredCatalog = [];
	let activeDeleteId = null;
	let lastDeletedItem = null;
	let currentViewMode = localStorage.getItem(VIEW_MODE_KEY) || 'table';

	// ==========================================
	// 3. DOM ЕЛЕМЕНТИ
	// ==========================================
	// Метрики
	const totalGiftsCountEl = document.getElementById('totalGiftsCount');
	const activeGiftsSubEl = document.getElementById('activeGiftsSub');
	const countMiniEl = document.getElementById('countMini');
	const countStandardEl = document.getElementById('countStandard');
	const countOptimalEl = document.getElementById('countOptimal');
	const countPremiumEl = document.getElementById('countPremium');
	const priceRangeValueEl = document.getElementById('priceRangeValue');
	const avgPriceSubEl = document.getElementById('avgPriceSub');

	// Фільтри та панель пошуку
	const searchInput = document.getElementById('searchInput');
	const clearSearchBtn = document.getElementById('clearSearchBtn');
	const filterRecipient = document.getElementById('filterRecipient');
	const filterOccasion = document.getElementById('filterOccasion');
	const filterTier = document.getElementById('filterTier');
	const sortBySelect = document.getElementById('sortBySelect');
	const resultsCountBadge = document.getElementById('resultsCountBadge');
	const resetFiltersBtn = document.getElementById('resetFiltersBtn');
	const clearSearchEmptyBtn = document.getElementById('clearSearchEmptyBtn');

	// Перемикач вигляду
	const tableViewBtn = document.getElementById('tableViewBtn');
	const gridViewBtn = document.getElementById('gridViewBtn');
	const tableContainer = document.getElementById('tableContainer');
	const cardsGridContainer = document.getElementById('cardsGridContainer');
	const emptyResultsBox = document.getElementById('emptyResultsBox');
	const catalogTableBody = document.getElementById('catalogTableBody');

	// Модалка додавання/редагування
	const giftModalOverlay = document.getElementById('giftModalOverlay');
	const openAddModalBtn = document.getElementById('openAddModalBtn');
	const closeModalBtn = document.getElementById('closeModalBtn');
	const cancelModalBtn = document.getElementById('cancelModalBtn');
	const giftEditForm = document.getElementById('giftEditForm');
	const modalTitle = document.getElementById('modalTitle');
	const saveBtnText = document.getElementById('saveBtnText');
	const draftSaveHint = document.getElementById('draftSaveHint');

	// Поля форми
	const giftIdInput = document.getElementById('giftIdInput');
	const giftTitleInput = document.getElementById('giftTitleInput');
	const giftRecipientSelect = document.getElementById('giftRecipientSelect');
	const giftOccasionSelect = document.getElementById('giftOccasionSelect');
	const giftPriceInput = document.getElementById('giftPriceInput');
	const giftTierSelect = document.getElementById('giftTierSelect');
	const giftBadgeInput = document.getElementById('giftBadgeInput');
	const giftBudgetMinInput = document.getElementById('giftBudgetMinInput');
	const giftBudgetMaxInput = document.getElementById('giftBudgetMaxInput');
	const giftImageInput = document.getElementById('giftImageInput');
	const giftAvailabilitySelect = document.getElementById('giftAvailabilitySelect');
	const giftRatingInput = document.getElementById('giftRatingInput');
	const giftDescriptionInput = document.getElementById('giftDescriptionInput');

	// Помилки форми
	const giftTitleError = document.getElementById('giftTitleError');
	const giftPriceError = document.getElementById('giftPriceError');
	const giftDescriptionError = document.getElementById('giftDescriptionError');

	// Складові набору (Items)
	const itemsListContainer = document.getElementById('itemsListContainer');
	const addItemRowBtn = document.getElementById('addItemRowBtn');
	const itemsSumDisplay = document.getElementById('itemsSumDisplay');
	const itemsSumComparisonBadge = document.getElementById('itemsSumComparisonBadge');

	// Живе прев'ю
	const prevBadge = document.getElementById('prevBadge');
	const prevImage = document.getElementById('prevImage');
	const prevTarget = document.getElementById('prevTarget');
	const prevTitle = document.getElementById('prevTitle');
	const prevDescription = document.getElementById('prevDescription');
	const prevItemsBox = document.getElementById('prevItemsBox');
	const prevItemsList = document.getElementById('prevItemsList');
	const prevPrice = document.getElementById('prevPrice');

	// Модалка видалення
	const deleteConfirmOverlay = document.getElementById('deleteConfirmOverlay');
	const deleteGiftTitle = document.getElementById('deleteGiftTitle');
	const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
	const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
	const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

	// Модалка скидання
	const resetConfirmOverlay = document.getElementById('resetConfirmOverlay');
	const resetCatalogBtn = document.getElementById('resetCatalogBtn');
	const closeResetModalBtn = document.getElementById('closeResetModalBtn');
	const cancelResetBtn = document.getElementById('cancelResetBtn');
	const confirmResetBtn = document.getElementById('confirmResetBtn');

	// Експорт / Імпорт
	const exportJsonBtn = document.getElementById('exportJsonBtn');
	const importJsonInput = document.getElementById('importJsonInput');

	// Тости
	const toastsContainer = document.getElementById('toastsContainer');

	// ==========================================
	// 4. ІНІЦІАЛІЗАЦІЯ ДАНИХ
	// ==========================================
	initAdminPanel();

	function initAdminPanel() {
		loadViewModePreference();
		loadFilterPreferences();
		loadCatalogFromStorageOrFile();
		setupEventListeners();
		checkDraftOnBoot();
	}

	/**
	 * Завантаження каталогу: з LocalStorage або з вбудованої бази DEFAULT_GIFTS_CATALOG
	 */
	function loadCatalogFromStorageOrFile() {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed) && parsed.length > 0) {
					catalog = parsed;
					applyFiltersAndRender();
					return;
				}
			} catch (e) {
				console.warn('Помилка читання LocalStorage:', e);
			}
		}

		// Якщо в LocalStorage порожньо — беремо повну вбудовану базу
		catalog = JSON.parse(JSON.stringify(DEFAULT_GIFTS_CATALOG));
		saveCatalogToStorage();
		applyFiltersAndRender();
	}

	/**
	 * Збереження каталогу в LocalStorage
	 */
	function saveCatalogToStorage() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
			showStorageIndicatorSuccess();
		} catch (e) {
			showToast('Помилка збереження в LocalStorage (переповнено квоту)', 'danger');
		}
	}

	function showStorageIndicatorSuccess() {
		const indicator = document.getElementById('storageIndicator');
		if (indicator) {
			indicator.classList.remove('pulse');
			void indicator.offsetWidth; // trigger reflow
			indicator.classList.add('pulse');
		}
	}

	// ==========================================
	// 5. ВІДОБРАЖЕННЯ, ФІЛЬТРАЦІЯ ТА СОРТУВАННЯ
	// ==========================================
	function applyFiltersAndRender() {
		const query = (searchInput.value || '').trim().toLowerCase();
		const recipient = filterRecipient.value;
		const occasion = filterOccasion.value;
		const tier = filterTier.value;
		const sort = sortBySelect.value;

		// Збереження фільтрів у LocalStorage
		saveFilterPreferences();

		// Фільтрація
		filteredCatalog = catalog.filter(item => {
			// Пошук за текстом
			if (query) {
				const titleMatch = (item.title || '').toLowerCase().includes(query);
				const descMatch = (item.description || '').toLowerCase().includes(query);
				const badgeMatch = (item.badge || '').toLowerCase().includes(query);
				const itemsMatch = Array.isArray(item.items) && item.items.some(it => (it.name || '').toLowerCase().includes(query));
				if (!titleMatch && !descMatch && !badgeMatch && !itemsMatch) {
					return false;
				}
			}

			// Отримувач
			if (recipient && item.recipient !== recipient && recipient !== 'Всі') {
				if (recipient === 'Друг' || recipient === 'Колега') {
					if (item.recipient !== recipient) return false;
				} else if (item.recipient !== recipient && item.recipient !== 'Всі') {
					return false;
				}
			}

			// Подія
			if (occasion && item.occasion !== occasion && occasion !== 'Всі') {
				if (item.occasion !== occasion && item.occasion !== 'Всі') {
					return false;
				}
			}

			// Категорія
			if (tier && item.tier !== tier) {
				return false;
			}

			return true;
		});

		// Сортування
		sortCatalog(filteredCatalog, sort);

		// Оновлення метрик та списків
		updateMetrics();
		renderCatalogViews();
		updateFiltersMetaUI();
	}

	function sortCatalog(list, sortType) {
		switch (sortType) {
			case 'price-asc':
				list.sort((a, b) => (a.price || 0) - (b.price || 0));
				break;
			case 'price-desc':
				list.sort((a, b) => (b.price || 0) - (a.price || 0));
				break;
			case 'title-asc':
				list.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'uk'));
				break;
			case 'rating-desc':
				list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
				break;
			case 'newest':
			default:
				// Залишаємо поточний порядок
				break;
		}
	}

	function updateMetrics() {
		const total = catalog.length;
		totalGiftsCountEl.textContent = total;
		activeGiftsSubEl.textContent = `${total} активних позицій у базі`;

		// Підрахунок за категоріями
		let miniCount = 0, stdCount = 0, optCount = 0, premCount = 0;
		let minPrice = Infinity, maxPrice = -Infinity, sumPrice = 0;

		catalog.forEach(item => {
			const tier = item.tier;
			if (tier === 'mini') miniCount++;
			else if (tier === 'standard') stdCount++;
			else if (tier === 'optimal') optCount++;
			else if (tier === 'premium') premCount++;

			const p = Number(item.price) || 0;
			if (p < minPrice) minPrice = p;
			if (p > maxPrice) maxPrice = p;
			sumPrice += p;
		});

		countMiniEl.textContent = miniCount;
		countStandardEl.textContent = stdCount;
		countOptimalEl.textContent = optCount;
		countPremiumEl.textContent = premCount;

		if (total > 0) {
			const avg = Math.round(sumPrice / total);
			priceRangeValueEl.textContent = `${minPrice.toLocaleString('uk-UA')} – ${maxPrice.toLocaleString('uk-UA')} грн`;
			avgPriceSubEl.textContent = `Сер. вартість: ${avg.toLocaleString('uk-UA')} грн`;
		} else {
			priceRangeValueEl.textContent = `0 грн`;
			avgPriceSubEl.textContent = `Сер. вартість: 0 грн`;
		}
	}

	function updateFiltersMetaUI() {
		resultsCountBadge.innerHTML = `Відображено: <strong>${filteredCatalog.length}</strong> з <strong>${catalog.length}</strong> подарунків`;
		const hasActiveFilter = searchInput.value.trim() !== '' ||
			filterRecipient.value !== '' ||
			filterOccasion.value !== '' ||
			filterTier.value !== '';

		resetFiltersBtn.style.display = hasActiveFilter ? 'inline-block' : 'none';
		clearSearchBtn.style.display = searchInput.value.trim() !== '' ? 'flex' : 'none';
	}

	function renderCatalogViews() {
		if (filteredCatalog.length === 0) {
			tableContainer.style.display = 'none';
			cardsGridContainer.style.display = 'none';
			emptyResultsBox.style.display = 'flex';
			return;
		}

		emptyResultsBox.style.display = 'none';

		if (currentViewMode === 'table') {
			tableContainer.style.display = 'block';
			cardsGridContainer.style.display = 'none';
			renderTableView();
		} else {
			tableContainer.style.display = 'none';
			cardsGridContainer.style.display = 'grid';
			renderGridView();
		}
	}

	/**
	 * Рендер таблиці
	 */
	function renderTableView() {
		catalogTableBody.innerHTML = '';

		filteredCatalog.forEach(item => {
			const tr = document.createElement('tr');
			tr.dataset.id = item.id;

			const occasionText = occasionLabels[item.occasion] || item.occasion;
			const itemsCount = Array.isArray(item.items) ? item.items.length : 0;
			const itemsPreview = Array.isArray(item.items)
				? item.items.map(it => it.name).join(', ')
				: '';

			const isPreorder = item.availability === 'Під замовлення' || item.availability === 'Очікується';
			const statusClass = isPreorder ? 'status-preorder' : 'status-in-stock';
			const statusText = item.availability || 'В наявності';

			const tierClass = `tier-${item.tier || 'standard'}`;
			const tierLabel = (item.tier || 'standard').toUpperCase();

			tr.innerHTML = `
				<td>
					<img src="${escapeHtml(item.image || DEFAULT_IMAGE)}" 
						alt="${escapeHtml(item.title)}" 
						class="table-img-thumb" 
						onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';">
				</td>
				<td>
					<div class="table-title-wrap">
						<span class="table-gift-title">${escapeHtml(item.title)}</span>
						${item.badge ? `<span class="table-badge-tag">${escapeHtml(item.badge)}</span>` : ''}
						<span class="table-gift-desc" title="${escapeHtml(item.description)}">${escapeHtml(item.description)}</span>
					</div>
				</td>
				<td>
					<div class="table-target-tag">
						<span>👤 <strong>${escapeHtml(item.recipient)}</strong></span>
						<span>🎉 ${escapeHtml(occasionText)}</span>
					</div>
				</td>
				<td>
					<span class="tier-pill ${tierClass}">${tierLabel}</span>
				</td>
				<td>
					<div class="table-items-count">📦 <strong>${itemsCount}</strong> поз.</div>
					<div class="table-items-preview" title="${escapeHtml(itemsPreview)}">${escapeHtml(itemsPreview || '—')}</div>
				</td>
				<td>
					<span class="table-price-val">${Number(item.price || 0).toLocaleString('uk-UA')} грн</span>
				</td>
				<td>
					<span class="status-pill ${statusClass}">${escapeHtml(statusText)}</span>
					<div style="font-size: 0.72rem; color: #f59e0b; margin-top: 2px;">⭐ ${item.rating || 4.9}</div>
				</td>
				<td>
					<div class="table-actions-cell">
						<button type="button" class="action-btn action-edit" title="Редагувати" data-edit-id="${item.id}">
							✏️
						</button>
						<button type="button" class="action-btn action-delete" title="Видалити" data-delete-id="${item.id}">
							🗑️
						</button>
					</div>
				</td>
			`;

			catalogTableBody.appendChild(tr);
		});
	}

	/**
	 * Рендер сітки карток
	 */
	function renderGridView() {
		cardsGridContainer.innerHTML = '';

		filteredCatalog.forEach(item => {
			const card = document.createElement('div');
			card.className = 'gift-card';
			card.dataset.id = item.id;

			const occasionText = occasionLabels[item.occasion] || item.occasion;
			const tierLabel = (item.tier || 'standard').toUpperCase();

			let itemsHtml = '';
			if (Array.isArray(item.items) && item.items.length > 0) {
				const list = item.items.slice(0, 3).map(it =>
					`<li><span>${escapeHtml(it.name)}</span> <strong>${Number(it.estCost || 0).toLocaleString('uk-UA')} грн</strong></li>`
				).join('');
				const more = item.items.length > 3 ? `<li style="color: #6366f1; font-style: italic;">+ ще ${item.items.length - 3} складових...</li>` : '';
				itemsHtml = `
					<div style="font-size: 0.78rem; font-weight: 700; color: #475569; margin-top: 0.5rem;">📦 Склад:</div>
					<ul class="card-items-list">${list}${more}</ul>
				`;
			}

			card.innerHTML = `
				<div class="card-badge">${escapeHtml(item.badge || tierLabel)}</div>
				<div class="card-card-actions">
					<button type="button" class="card-action-btn action-edit" title="Редагувати" data-edit-id="${item.id}">✏️</button>
					<button type="button" class="card-action-btn action-delete" title="Видалити" data-delete-id="${item.id}">🗑️</button>
				</div>
				<div class="card-img-wrap">
					<img src="${escapeHtml(item.image || DEFAULT_IMAGE)}" 
						alt="${escapeHtml(item.title)}" 
						onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';">
				</div>
				<div class="card-body">
					<div class="card-target-tag">👤 Для: <strong>${escapeHtml(item.recipient)}</strong> • ${escapeHtml(occasionText)}</div>
					<h3 class="card-title">${escapeHtml(item.title)}</h3>
					<p class="card-description">${escapeHtml(item.description)}</p>
					${itemsHtml}
					<div class="card-footer">
						<div class="card-price">Реальна вартість: <strong>${Number(item.price || 0).toLocaleString('uk-UA')} грн</strong></div>
						<span style="font-size: 0.76rem; color: #f59e0b;">⭐ ${item.rating || 4.9}</span>
					</div>
				</div>
			`;

			cardsGridContainer.appendChild(card);
		});
	}

	// ==========================================
	// 6. МОДАЛЬНЕ ВІКНО: ДОДАВАННЯ ТА РЕДАГУВАННЯ
	// ==========================================
	function openAddModal() {
		resetForm();
		giftIdInput.value = '';
		modalTitle.textContent = '✨ Додати новий подарунок';
		saveBtnText.textContent = 'Додати подарунок';

		// Перевіряємо чи є збережена чернетка
		const draft = localStorage.getItem(DRAFT_KEY);
		if (draft) {
			try {
				const draftData = JSON.parse(draft);
				if (draftData && !draftData.id) {
					fillFormWithData(draftData);
					draftSaveHint.textContent = '📝 Відновлено збережену чернетку';
				}
			} catch (e) {}
		}

		updateLivePreview();
		giftModalOverlay.style.display = 'flex';
		giftTitleInput.focus();
	}

	function openEditModal(giftId) {
		const item = catalog.find(g => g.id === giftId);
		if (!item) {
			showToast('Подарунок не знайдено', 'danger');
			return;
		}

		resetForm();
		giftIdInput.value = item.id;
		modalTitle.textContent = `✏️ Редагувати: ${item.title}`;
		saveBtnText.textContent = 'Зберегти зміни';
		draftSaveHint.textContent = '💾 Зміни синхронізуються';

		fillFormWithData(item);
		updateLivePreview();
		giftModalOverlay.style.display = 'flex';
	}

	function fillFormWithData(data) {
		giftTitleInput.value = data.title || '';
		giftRecipientSelect.value = data.recipient || 'Мама';
		giftOccasionSelect.value = data.occasion || 'ДН';
		giftPriceInput.value = data.price || '';
		giftTierSelect.value = data.tier || 'standard';
		giftBadgeInput.value = data.badge || '';
		giftBudgetMinInput.value = data.budgetMin || '';
		giftBudgetMaxInput.value = data.budgetMax || '';
		giftImageInput.value = data.image || '';
		giftAvailabilitySelect.value = data.availability || 'В наявності';
		giftRatingInput.value = data.rating || 4.9;
		giftDescriptionInput.value = data.description || '';

		// Заповнення складових
		itemsListContainer.innerHTML = '';
		if (Array.isArray(data.items) && data.items.length > 0) {
			data.items.forEach(it => addItemRow(it.name, it.estCost));
		} else {
			addItemRow('', '');
		}

		updateItemsSum();
	}

	function closeGiftModal() {
		giftModalOverlay.style.display = 'none';
	}

	function resetForm() {
		giftEditForm.reset();
		giftIdInput.value = '';
		itemsListContainer.innerHTML = '';
		clearErrors();
		draftSaveHint.textContent = '💾 Чернетка зберігається автоматично';
	}

	function clearErrors() {
		[giftTitleInput, giftPriceInput, giftDescriptionInput].forEach(inp => {
			if (inp) inp.classList.remove('invalid');
		});
		giftTitleError.style.display = 'none';
		giftPriceError.style.display = 'none';
		giftDescriptionError.style.display = 'none';
	}

	// ==========================================
	// 7. ДИНАМІЧНИЙ СПИСОК СКЛАДОВИХ (ITEMS)
	// ==========================================
	function addItemRow(name = '', cost = '') {
		const row = document.createElement('div');
		row.className = 'item-row';
		row.innerHTML = `
			<input type="text" class="item-name-input" placeholder="Назва елемента (напр: Плед із вовни)" value="${escapeHtml(name)}">
			<input type="number" class="item-cost-input" placeholder="Ціна, грн" min="0" value="${cost}">
			<button type="button" class="item-remove-btn" title="Видалити елемент">🗑️</button>
		`;

		const nameInp = row.querySelector('.item-name-input');
		const costInp = row.querySelector('.item-cost-input');
		const removeBtn = row.querySelector('.item-remove-btn');

		nameInp.addEventListener('input', () => {
			updateItemsSum();
			updateLivePreview();
			triggerDraftSave();
		});

		costInp.addEventListener('input', () => {
			updateItemsSum();
			updateLivePreview();
			triggerDraftSave();
		});

		removeBtn.addEventListener('click', () => {
			row.remove();
			updateItemsSum();
			updateLivePreview();
			triggerDraftSave();
		});

		itemsListContainer.appendChild(row);
		updateItemsSum();
		updateLivePreview();
	}

	function collectItemsData() {
		const items = [];
		const rows = itemsListContainer.querySelectorAll('.item-row');
		rows.forEach(r => {
			const name = r.querySelector('.item-name-input').value.trim();
			const cost = parseFloat(r.querySelector('.item-cost-input').value) || 0;
			if (name) {
				items.push({ name, estCost: cost });
			}
		});
		return items;
	}

	function updateItemsSum() {
		const items = collectItemsData();
		const totalSum = items.reduce((acc, it) => acc + (it.estCost || 0), 0);
		itemsSumDisplay.textContent = `${totalSum.toLocaleString('uk-UA')} грн`;

		const giftPrice = parseFloat(giftPriceInput.value) || 0;
		if (giftPrice > 0 && totalSum > 0) {
			if (Math.abs(giftPrice - totalSum) < 1) {
				itemsSumComparisonBadge.textContent = '✓ Співпадає з ціною подарунка';
				itemsSumComparisonBadge.className = 'sum-badge match';
			} else if (totalSum < giftPrice) {
				const diff = giftPrice - totalSum;
				itemsSumComparisonBadge.textContent = `Залишок на пакування: +${diff.toLocaleString('uk-UA')} грн`;
				itemsSumComparisonBadge.className = 'sum-badge';
			} else {
				const diff = totalSum - giftPrice;
				itemsSumComparisonBadge.textContent = `Складові перевищують ціну на: ${diff.toLocaleString('uk-UA')} грн`;
				itemsSumComparisonBadge.className = 'sum-badge mismatch';
			}
		} else {
			itemsSumComparisonBadge.textContent = '';
		}
	}

	// ==========================================
	// 8. ЖИВЕ ПРЕВ'Ю КАРТКИ В РЕАЛЬНОМУ ЧАСІ
	// ==========================================
	function updateLivePreview() {
		const title = giftTitleInput.value.trim() || 'Назва подарунка';
		const recipient = giftRecipientSelect.value || 'Мама';
		const occasion = giftOccasionSelect.value || 'ДН';
		const occasionText = occasionLabels[occasion] || occasion;
		const price = parseFloat(giftPriceInput.value) || 0;
		const badge = giftBadgeInput.value.trim() || (giftTierSelect.value || 'Mini').toUpperCase();
		const image = giftImageInput.value.trim() || DEFAULT_IMAGE;
		const desc = giftDescriptionInput.value.trim() || 'Детальний опис подарунка з\'явиться тут під час заповнення форми.';

		prevTitle.textContent = title;
		prevTarget.innerHTML = `👤 Для: <strong>${escapeHtml(recipient)}</strong> • ${escapeHtml(occasionText)}`;
		prevPrice.textContent = `${price.toLocaleString('uk-UA')} грн`;
		prevBadge.textContent = badge;
		prevDescription.textContent = desc;

		prevImage.src = image;
		prevImage.onerror = () => { prevImage.src = DEFAULT_IMAGE; };

		const items = collectItemsData();
		if (items.length > 0) {
			prevItemsBox.style.display = 'block';
			prevItemsList.innerHTML = items.map(it =>
				`<li><span>${escapeHtml(it.name)}</span> <strong>${it.estCost.toLocaleString('uk-UA')} грн</strong></li>`
			).join('');
		} else {
			prevItemsBox.style.display = 'none';
			prevItemsList.innerHTML = '';
		}
	}

	// ==========================================
	// 9. АВТОМАТИЧНЕ ЗБЕРЕЖЕННЯ ЧЕРНЕТКИ (AUTO-SAVE)
	// ==========================================
	let draftTimeout = null;
	function triggerDraftSave() {
		clearTimeout(draftTimeout);
		draftTimeout = setTimeout(() => {
			const draftData = {
				id: giftIdInput.value,
				title: giftTitleInput.value,
				recipient: giftRecipientSelect.value,
				occasion: giftOccasionSelect.value,
				price: giftPriceInput.value,
				tier: giftTierSelect.value,
				badge: giftBadgeInput.value,
				budgetMin: giftBudgetMinInput.value,
				budgetMax: giftBudgetMaxInput.value,
				image: giftImageInput.value,
				availability: giftAvailabilitySelect.value,
				rating: giftRatingInput.value,
				description: giftDescriptionInput.value,
				items: collectItemsData()
			};

			try {
				localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
				draftSaveHint.textContent = '💾 Чернетку збережено автоматично ' + new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
			} catch (e) {}
		}, 300);
	}

	function checkDraftOnBoot() {
		const draft = localStorage.getItem(DRAFT_KEY);
		if (draft) {
			try {
				const parsed = JSON.parse(draft);
				if (parsed && (parsed.title || parsed.description)) {
					showToast('Знайдено збережену чернетку з попередньої сесії 📝', 'info');
				}
			} catch (e) {}
		}
	}

	// ==========================================
	// 10. АВТОПІДБІР КАТЕГОРІЇ (TIER) ЗА ЦІНОЮ
	// ==========================================
	giftPriceInput.addEventListener('input', () => {
		const price = parseFloat(giftPriceInput.value) || 0;
		if (price > 0) {
			let autoTier = 'optimal';
			let min = 50;
			let max = 300;

			if (price <= 300) {
				autoTier = 'mini';
				min = 50;
				max = 300;
			} else if (price <= 900) {
				autoTier = 'standard';
				min = 301;
				max = 900;
			} else if (price < 2500) {
				autoTier = 'optimal';
				min = 901;
				max = 2400;
			} else {
				autoTier = 'premium';
				min = 2500;
				max = 10000;
			}

			giftTierSelect.value = autoTier;
			if (!giftBudgetMinInput.value || giftBudgetMinInput.dataset.autoFilled) {
				giftBudgetMinInput.value = min;
				giftBudgetMinInput.dataset.autoFilled = 'true';
			}
			if (!giftBudgetMaxInput.value || giftBudgetMaxInput.dataset.autoFilled) {
				giftBudgetMaxInput.value = max;
				giftBudgetMaxInput.dataset.autoFilled = 'true';
			}
		}

		updateItemsSum();
		updateLivePreview();
		triggerDraftSave();
	});

	// ==========================================
	// 11. ВІДПРАВКА ТА ВАЛІДАЦІЯ ФОРМИ
	// ==========================================
	giftEditForm.addEventListener('submit', (e) => {
		e.preventDefault();
		clearErrors();

		const title = giftTitleInput.value.trim();
		const price = parseFloat(giftPriceInput.value);
		const description = giftDescriptionInput.value.trim();

		let hasError = false;

		if (!title) {
			giftTitleInput.classList.add('invalid');
			giftTitleError.style.display = 'block';
			hasError = true;
		}

		if (!price || price <= 0 || isNaN(price)) {
			giftPriceInput.classList.add('invalid');
			giftPriceError.style.display = 'block';
			hasError = true;
		}

		if (!description) {
			giftDescriptionInput.classList.add('invalid');
			giftDescriptionError.style.display = 'block';
			hasError = true;
		}

		if (hasError) {
			showToast('Будь ласка, заповніть обов\'язкові поля форми!', 'warning');
			return;
		}

		const giftId = giftIdInput.value.trim();
		const isEditMode = !!giftId;

		const giftData = {
			id: isEditMode ? giftId : `gift-${Date.now()}`,
			title,
			recipient: giftRecipientSelect.value,
			occasion: giftOccasionSelect.value,
			price: Math.round(price),
			currency: 'грн',
			tier: giftTierSelect.value || 'standard',
			badge: giftBadgeInput.value.trim() || ((giftTierSelect.value || 'mini').toUpperCase()),
			budgetMin: parseFloat(giftBudgetMinInput.value) || 50,
			budgetMax: parseFloat(giftBudgetMaxInput.value) || (price * 1.5),
			image: giftImageInput.value.trim() || DEFAULT_IMAGE,
			availability: giftAvailabilitySelect.value || 'В наявності',
			rating: parseFloat(giftRatingInput.value) || 4.9,
			description,
			items: collectItemsData()
		};

		if (isEditMode) {
			const idx = catalog.findIndex(g => g.id === giftId);
			if (idx !== -1) {
				catalog[idx] = giftData;
				showToast(`Зміни для «${giftData.title}» збережено! 💾`, 'success');
			} else {
				catalog.unshift(giftData);
				showToast(`Подарунок «${giftData.title}» додано! 🚀`, 'success');
			}
		} else {
			catalog.unshift(giftData);
			showToast(`Новий подарунок «${giftData.title}» успішно додано! 🚀`, 'success');
		}

		saveCatalogToStorage();
		localStorage.removeItem(DRAFT_KEY);
		closeGiftModal();
		applyFiltersAndRender();
	});

	// ==========================================
	// 12. ВИДАЛЕННЯ ПОДАРУНКА
	// ==========================================
	function openDeleteConfirm(giftId) {
		const item = catalog.find(g => g.id === giftId);
		if (!item) return;

		activeDeleteId = giftId;
		deleteGiftTitle.textContent = item.title;
		deleteConfirmOverlay.style.display = 'flex';
	}

	function closeDeleteConfirm() {
		activeDeleteId = null;
		deleteConfirmOverlay.style.display = 'none';
	}

	confirmDeleteBtn.addEventListener('click', () => {
		if (!activeDeleteId) return;

		const idx = catalog.findIndex(g => g.id === activeDeleteId);
		if (idx !== -1) {
			lastDeletedItem = catalog[idx];
			const title = lastDeletedItem.title;

			catalog.splice(idx, 1);
			saveCatalogToStorage();
			applyFiltersAndRender();

			showToast(`Подарунок «${title}» видалено 🗑️`, 'warning');
		}

		closeDeleteConfirm();
	});

	// ==========================================
	// 13. СКИДАННЯ КАТАЛОГУ ДО СТАНДАРТНИХ (RESET)
	// ==========================================
	function resetCatalogToDefault() {
		catalog = JSON.parse(JSON.stringify(DEFAULT_GIFTS_CATALOG));
		saveCatalogToStorage();
		localStorage.removeItem(DRAFT_KEY);
		searchInput.value = '';
		filterRecipient.value = '';
		filterOccasion.value = '';
		filterTier.value = '';
		sortBySelect.value = 'newest';
		applyFiltersAndRender();
		closeResetConfirm();
		showToast(`Каталог успішно скинуто до початкових ${catalog.length} подарунків! 🔄`, 'success');
	}

	function openResetConfirm() {
		resetConfirmOverlay.style.display = 'flex';
	}

	function closeResetConfirm() {
		resetConfirmOverlay.style.display = 'none';
	}

	// Клік на кнопку "🔄 Скинути" у верхній панелі
	resetCatalogBtn.addEventListener('click', () => {
		openResetConfirm();
	});

	// Підтвердження скидання у модальному вікні
	confirmResetBtn.addEventListener('click', () => {
		resetCatalogToDefault();
	});

	// ==========================================
	// 14. ЕКСПОРТ ТА ІМПОРТ У ФОРМАТІ JSON
	// ==========================================
	exportJsonBtn.addEventListener('click', () => {
		try {
			const jsonStr = JSON.stringify(catalog, null, 2);
			const blob = new Blob([jsonStr], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `gifts_catalog_${new Date().toISOString().slice(0, 10)}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			showToast('Резервну копію каталогу успішно завантажено! 📥', 'success');
		} catch (e) {
			showToast('Помилка при експорті JSON', 'danger');
		}
	});

	importJsonInput.addEventListener('change', (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const imported = JSON.parse(event.target.result);
				if (Array.isArray(imported) && imported.length > 0) {
					const valid = imported.every(it => it.title && it.price);
					if (!valid) {
						showToast('Файл містить некоректні дані подарунків', 'danger');
						return;
					}

					catalog = imported;
					saveCatalogToStorage();
					applyFiltersAndRender();
					showToast(`Успішно імпортовано ${imported.length} подарунків! 📤`, 'success');
				} else {
					showToast('JSON файл порожній або не є масивом', 'danger');
				}
			} catch (err) {
				showToast('Помилка читання JSON файлу', 'danger');
			}
			importJsonInput.value = '';
		};
		reader.readAsText(file);
	});

	// ==========================================
	// 15. НАЛАШТУВАННЯ СЛУХАЧІВ ПОДІЙ
	// ==========================================
	function setupEventListeners() {
		// Відкриття та закриття модалок
		openAddModalBtn.addEventListener('click', openAddModal);
		closeModalBtn.addEventListener('click', closeGiftModal);
		cancelModalBtn.addEventListener('click', closeGiftModal);

		closeDeleteModalBtn.addEventListener('click', closeDeleteConfirm);
		cancelDeleteBtn.addEventListener('click', closeDeleteConfirm);

		closeResetModalBtn.addEventListener('click', closeResetConfirm);
		cancelResetBtn.addEventListener('click', closeResetConfirm);

		// Закриття модалок по кліку на overlay або Esc
		[giftModalOverlay, deleteConfirmOverlay, resetConfirmOverlay].forEach(overlay => {
			if (overlay) {
				overlay.addEventListener('click', (e) => {
					if (e.target === overlay) {
						overlay.style.display = 'none';
					}
				});
			}
		});

		window.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				giftModalOverlay.style.display = 'none';
				deleteConfirmOverlay.style.display = 'none';
				resetConfirmOverlay.style.display = 'none';
			}
		});

		// Додавання рядка складових
		addItemRowBtn.addEventListener('click', () => addItemRow('', ''));

		// Живі зміни у формі
		[
			giftTitleInput, giftRecipientSelect, giftOccasionSelect,
			giftTierSelect, giftBadgeInput, giftBudgetMinInput,
			giftBudgetMaxInput, giftImageInput, giftAvailabilitySelect,
			giftRatingInput, giftDescriptionInput
		].forEach(el => {
			if (el) {
				el.addEventListener('input', () => {
					updateLivePreview();
					triggerDraftSave();
				});
				el.addEventListener('change', () => {
					updateLivePreview();
					triggerDraftSave();
				});
			}
		});

		// Швидкі пресети зображень
		document.querySelectorAll('.preset-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				const url = btn.dataset.url;
				if (url) {
					giftImageInput.value = url;
					updateLivePreview();
					triggerDraftSave();
				}
			});
		});

		// Пошук та фільтри
		searchInput.addEventListener('input', () => {
			applyFiltersAndRender();
		});

		clearSearchBtn.addEventListener('click', () => {
			searchInput.value = '';
			applyFiltersAndRender();
			searchInput.focus();
		});

		clearSearchEmptyBtn.addEventListener('click', () => {
			resetFilters();
			showToast('Параметри пошуку скинуто! 🧹', 'info');
		});

		resetFiltersBtn.addEventListener('click', () => {
			resetFilters();
			showToast('Фільтри скинуто! 🧹', 'info');
		});

		[filterRecipient, filterOccasion, filterTier, sortBySelect].forEach(select => {
			if (select) {
				select.addEventListener('change', applyFiltersAndRender);
			}
		});

		// Перемикач вигляду (Таблиця / Сітка)
		tableViewBtn.addEventListener('click', () => {
			setViewMode('table');
		});

		gridViewBtn.addEventListener('click', () => {
			setViewMode('grid');
		});

		// Делегування подій для кнопок Редагування та Видалення в таблиці/сітці
		document.addEventListener('click', (e) => {
			const editBtn = e.target.closest('[data-edit-id]');
			if (editBtn) {
				const id = editBtn.dataset.editId;
				openEditModal(id);
				return;
			}

			const deleteBtn = e.target.closest('[data-delete-id]');
			if (deleteBtn) {
				const id = deleteBtn.dataset.deleteId;
				openDeleteConfirm(id);
				return;
			}
		});

		// Синхронізація між вкладками браузера (storage event)
		window.addEventListener('storage', (e) => {
			if (e.key === STORAGE_KEY && e.newValue) {
				try {
					const updated = JSON.parse(e.newValue);
					if (Array.isArray(updated)) {
						catalog = updated;
						applyFiltersAndRender();
						showToast('Каталог оновлено з іншої вкладки браузера! 🔄', 'info');
					}
				} catch (err) {}
			}
		});
	}

	function resetFilters() {
		searchInput.value = '';
		filterRecipient.value = '';
		filterOccasion.value = '';
		filterTier.value = '';
		sortBySelect.value = 'newest';
		applyFiltersAndRender();
	}

	function setViewMode(mode) {
		currentViewMode = mode;
		localStorage.setItem(VIEW_MODE_KEY, mode);
		if (mode === 'table') {
			tableViewBtn.classList.add('active');
			gridViewBtn.classList.remove('active');
		} else {
			gridViewBtn.classList.add('active');
			tableViewBtn.classList.remove('active');
		}
		renderCatalogViews();
	}

	function loadViewModePreference() {
		if (currentViewMode === 'grid') {
			gridViewBtn.classList.add('active');
			tableViewBtn.classList.remove('active');
		} else {
			tableViewBtn.classList.add('active');
			gridViewBtn.classList.remove('active');
		}
	}

	function saveFilterPreferences() {
		const filters = {
			recipient: filterRecipient.value,
			occasion: filterOccasion.value,
			tier: filterTier.value,
			sort: sortBySelect.value
		};
		try {
			localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
		} catch (e) {}
	}

	function loadFilterPreferences() {
		try {
			const stored = localStorage.getItem(FILTERS_KEY);
			if (stored) {
				const f = JSON.parse(stored);
				if (f.recipient) filterRecipient.value = f.recipient;
				if (f.occasion) filterOccasion.value = f.occasion;
				if (f.tier) filterTier.value = f.tier;
				if (f.sort) sortBySelect.value = f.sort;
			}
		} catch (e) {}
	}

	// ==========================================
	// 16. СИСТЕМА СПОВІЩЕНЬ (TOASTS)
	// ==========================================
	function showToast(message, type = 'info') {
		const toast = document.createElement('div');
		toast.className = `toast toast-${type}`;

		let icon = 'ℹ️';
		if (type === 'success') icon = '✅';
		if (type === 'warning') icon = '⚠️';
		if (type === 'danger') icon = '🚨';

		toast.innerHTML = `
			<span class="toast-icon">${icon}</span>
			<div class="toast-body">${escapeHtml(message)}</div>
			<button type="button" class="toast-close" aria-label="Закрити">✕</button>
		`;

		const closeBtn = toast.querySelector('.toast-close');
		closeBtn.addEventListener('click', () => {
			toast.style.opacity = '0';
			toast.style.transform = 'translateX(100%)';
			setTimeout(() => toast.remove(), 250);
		});

		toastsContainer.appendChild(toast);

		setTimeout(() => {
			if (toast.isConnected) {
				toast.style.opacity = '0';
				toast.style.transform = 'translateX(100%)';
				setTimeout(() => toast.remove(), 250);
			}
		}, 3800);
	}

	// ==========================================
	// 17. ДОПОМІЖНІ ФУНКЦІЇ
	// ==========================================
	function escapeHtml(str) {
		if (typeof str !== 'string') return str == null ? '' : String(str);
		return str
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}
});
