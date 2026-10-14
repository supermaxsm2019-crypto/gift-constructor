/**
 * Конструктор подарунків — Сценарій роботи
 * 
 * Стани:
 * 1. Empty State (Пустий екран)
 * 2. Filled Form State (Заповнена форма)
 * 3. Error State (Помилка валідації)
 * 4. Result State (Один рекомендований подарунок із реалістичною ціною)
 */

document.addEventListener('DOMContentLoaded', () => {
	// 1. Елементи DOM
	const form = document.getElementById('giftForm');
	const recipientSelect = document.getElementById('recipientSelect');
	const occasionSelect = document.getElementById('occasionSelect');
	const budgetInput = document.getElementById('budgetInput');
	const errorMessage = document.getElementById('errorMessage');

	const rezultatContainer = document.getElementById('rezultatContainer');
	const emptyStateContent = document.querySelector('.empty-state-content');
	const resultCard = document.getElementById('resultCard');

	// 2. Словник назв подій
	const occasionLabels = {
		"ДН": "День Народження",
		"НР": "Новий Рік",
		"8Б": "8 Березня",
		"Весілля": "Весілля"
	};

	// 3. База подарунків із реальними цінами, тематичними фото та наповненням (синхронізована з gifts.json)
	let giftsCatalog = [
		// --- РІВЕНЬ 1: MINI (50 - 300 грн) — Дрібнички та милі компліменти ---
		{
			id: "mini-gingerbread",
			tier: "mini",
			budgetMin: 50,
			budgetMax: 300,
			recipient: "Всі",
			occasion: "НР",
			badge: "Дрібничка до свята",
			title: "Святковий медово-імбирний пряник ручної роботи",
			description: "Ніжний розписний імбирний пряник із додаванням натурального меду, кориці та гвоздики. Упакований у святковий пакетик із джутовим бантиком. Ідеальний теплий комплімент при бюджеті до 100 грн.",
			items: [
				{ name: "Імбирний пряник ручного розпису глазур'ю (100 г)", estCost: 70 },
				{ name: "Святковий крафтовий пакетик із джутовим шнурком", estCost: 20 }
			],
			price: 90,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1543255006-d6395b6f1171?w=600&q=80"
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
			description: "Зворушливий бюджетний комплімент: дизайнерська листівка для теплих слів і саше запашного трав'яного чаю з мелісою та м'ятою.",
			items: [
				{ name: "Дизайнерська листівка ручної роботи з конвертом", estCost: 55 },
				{ name: "Порційне крафтове саше трав'яного чаю (25 г)", estCost: 40 }
			],
			price: 95,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&q=80"
		},
		{
			id: "mini-chocolate-mama",
			tier: "mini",
			budgetMin: 50,
			budgetMax: 300,
			recipient: "Мама",
			occasion: "ДН",
			badge: "Солодкий комплімент",
			title: "Крафтова міні-плитка шоколаду з лісовими ягодами",
			description: "Натуральний темний бельгійський шоколад ручної роботи з сублімованою малиною та пелюстками волошок у крафтовій обгортці.",
			items: [
				{ name: "Плитка крафтового шоколаду з ягодами (80 г)", estCost: 80 },
				{ name: "Міні-листівка з теплими побажаннями", estCost: 20 }
			],
			price: 100,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=80"
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
			image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&q=80"
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
			description: "Смачна та корисна зимова дрібничка: баночка натурального меду з цільними волоськими горіхами, прикрашена крафтовою шапочкою.",
			items: [
				{ name: "Баночка натурального меду з горіхами (130 г)", estCost: 85 },
				{ name: "Крафтове оформлення з дерев'яною ложечкою", estCost: 25 }
			],
			price: 110,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80"
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
			description: "Приємний щоденний догляд: зволожуюча корейська маска з екстрактом алое та натуральний гігієнічний бальзам для губ із кокосовою олією.",
			items: [
				{ name: "Тканинна зволожуюча маска для обличчя", estCost: 55 },
				{ name: "Натуральний бальзам для губ (кокос)", estCost: 45 }
			],
			price: 100,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80"
		},
		{
			id: "mini-stickers-brat",
			tier: "mini",
			budgetMin: 50,
			budgetMax: 300,
			recipient: "Брат",
			occasion: "ДН",
			badge: "Tech-дрібничка",
			title: "Стікерпак вінілових наліпок & Шоколадний батончик",
			description: "Набір стильних вологостійких вінілових наліпок для ноутбука у стилі IT/Gaming та крафтовий шоколадний батончик із карамеллю.",
			items: [
				{ name: "Набір вінілових стікерів (15 шт.)", estCost: 60 },
				{ name: "Крафтовий шоколадно-горіховий батончик", estCost: 35 }
			],
			price: 95,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80"
		},

		// --- РІВЕНЬ 2: STANDARD (301 - 900 грн) — Корисні аксесуари та базові набори ---
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
			image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80"
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
			image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&q=80"
		},
		{
			id: "standard-leather-tato",
			tier: "standard",
			budgetMin: 301,
			budgetMax: 900,
			recipient: "Тато",
			occasion: "ДН",
			badge: "Аксесуар",
			title: "Шкіряний кардхолдер Crazy Horse",
			description: "Компактний та тонкий гаманець для карток і купюр із натуральної шкіри Crazy Horse. Зручно носити в кишені без зайвого об'єму.",
			items: [
				{ name: "Шкіряний кардхолдер на 6 відділень", estCost: 480 },
				{ name: "Крафтова подарункова коробочка з наповнювачем", estCost: 70 }
			],
			price: 550,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"
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
			description: "Пачка свіжообсмаженої фермерської Арабіки з нотами карамелі та горіхів у парі з плиткою гірського екстрачорного шоколаду.",
			items: [
				{ name: "Свіжообсмажена кава в зернах Specialty (250 г)", estCost: 320 },
				{ name: "Плитка крафтового шоколаду 75% какао", estCost: 160 },
				{ name: "Подарунковий паперовий пакет", estCost: 40 }
			],
			price: 520,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80"
		},
		{
			id: "standard-cardholder-brat",
			tier: "standard",
			budgetMin: 301,
			budgetMax: 900,
			recipient: "Брат",
			occasion: "8Б",
			badge: "Стиль",
			title: "Мінімалістичний шкіряний кардхолдер & Ключниця",
			description: "Тонкий шкіряний кардхолдер із захистом RFID та міцна шкіряна ключниця ручної роботи на карабіні.",
			items: [
				{ name: "Шкіряний кардхолдер із RFID-захистом", estCost: 550 },
				{ name: "Шкіряна ключниця на сталевому карабіні", estCost: 240 },
				{ name: "Крафтове пакування", estCost: 60 }
			],
			price: 850,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"
		},

		// --- РІВЕНЬ 3: OPTIMAL (901 - 2 400 грн) — Повноцінні подарункові бокси ---
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
			image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80"
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
			image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80"
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
				{ name: "Класичний шкіряний ремінь із масивною пряжкою", estCost: 620 },
				{ name: "Дерев'яна подарункова коробка з гравіюванням", estCost: 190 },
				{ name: "Бальзам-віск для догляду за шкірою", estCost: 90 }
			],
			price: 1650,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80"
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
			description: "Вакуумний термос із харчової нержавіючої сталі 18/8 (тримає тепло 24 години) та теплий шарф із мериносової вовни в подарунковому боксі.",
			items: [
				{ name: "Вакуумний термос із нержавіючої сталі (750 мл)", estCost: 580 },
				{ name: "Шарф із натуральної мериносової вовни", estCost: 420 },
				{ name: "Карпатський чай та святкове пакування", estCost: 200 }
			],
			price: 1200,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=600&q=80"
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
			description: "Класична гейзерна кавоварка на 3 порції, пачка свіжообсмаженої арабіки Specialty та стильна термокружка подвійної стінки.",
			items: [
				{ name: "Гейзерна кавоварка з харчового алюмінію", estCost: 640 },
				{ name: "Свіжообсмажена кава в зернах Specialty (250 г)", estCost: 320 },
				{ name: "Термокружка подвійної стінки (350 мл)", estCost: 360 },
				{ name: "Подарунковий тубус", estCost: 130 }
			],
			price: 1450,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80"
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
			image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80"
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
			description: "Ергономічна бездротова миша з високим DPI, павербанк 20000 mAh зі швидкою зарядкою 22.5W та великий ігровий килимок.",
			items: [
				{ name: "Бездротова оптична миша з регулюванням DPI", estCost: 680 },
				{ name: "Павербанк 20000 mAh зі швидкою зарядкою 22.5W", estCost: 590 },
				{ name: "Ігровий килимок Speed (800x300 мм)", estCost: 280 }
			],
			price: 1550,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80"
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
			image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80"
		},

		// --- РІВЕНЬ 4: PREMIUM (від 2 500 грн) — Розкішні та статусні набори ---
		{
			id: "premium-silk-perfume",
			tier: "premium",
			budgetMin: 2500,
			budgetMax: 10000,
			recipient: "Сестра",
			occasion: "Весілля",
			badge: "Шик & Люкс (від 2 500 грн)",
			title: "Шовковий халат-кімоно & Нішевий вечірній парфум",
			description: "Розкішний набір найвищого ґатунку: халат-кімоно із 100% натурального шовку Mulberry з витонченим мереживом та флакон авторського нішевого парфуму (Eau de Parfum, 50 мл) із пудровими, ірисовими та сандаловими акордами.",
			items: [
				{ name: "Халат-кімоно із 100% натурального шовку Mulberry", estCost: 1850 },
				{ name: "Флакон авторського нішевого парфуму Eau de Parfum (50 мл)", estCost: 950 },
				{ name: "Преміальний футляр на магнітному замку з шовковою стрічкою", estCost: 100 }
			],
			price: 2900,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80"
		},
		{
			id: "premium-crystal-wine",
			tier: "premium",
			budgetMin: 2500,
			budgetMax: 10000,
			recipient: "Мама",
			occasion: "Весілля",
			badge: "Елегантність (від 2 500 грн)",
			title: "Елегантний сет: Кришталевий декантер & Келихи для вина",
			description: "Вишуканий набір із богемського кришталю ручної огранки. Включає масивний аераційний декантер та пару келихів у розкішному оксамитовому ложементі.",
			items: [
				{ name: "Аераційний декантер із богемського кришталю (1.2 л)", estCost: 1350 },
				{ name: "Пара кришталевих келихів для вина з тонкою ніжкою", estCost: 850 },
				{ name: "Оксамитовий подарунковий презентаційний кейс", estCost: 400 }
			],
			price: 2600,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80"
		},
		{
			id: "premium-watch-tato",
			tier: "premium",
			budgetMin: 2500,
			budgetMax: 10000,
			recipient: "Тато",
			occasion: "Весілля",
			badge: "Преміум (від 2 500 грн)",
			title: "Класичний наручний годинник із сапфіровим склом & Гравіювання",
			description: "Елітний чоловічий годинник у корпусі з хірургічної сталі 316L, сапфіровим склом, ремінцем із натуральної телячої шкіри та пам'ятним алмазним гравіюванням у футлярі з червоного дерева.",
			items: [
				{ name: "Швейцарсько-японський кварцовий годинник із сапфіровим склом", estCost: 2900 },
				{ name: "Індивідуальне алмазне гравіювання пам'ятних слів", estCost: 350 },
				{ name: "Футляр із полірованого червоного дерева з оксамитом", estCost: 450 },
				{ name: "Сертифікат якості та міжнародна гарантія", estCost: 100 }
			],
			price: 3800,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80"
		},
		{
			id: "premium-cufflinks-brat",
			tier: "premium",
			budgetMin: 2500,
			budgetMax: 10000,
			recipient: "Брат",
			occasion: "Весілля",
			badge: "Преміум (від 2 500 грн)",
			title: "Срібні запонки 925 проби & Елітний годинник",
			description: "Статусний весільний комплект: авторські ювелірні запонки зі стерлінгового срібла 925 проби та тонкий класичний наручний годинник у велюровому футлярі.",
			items: [
				{ name: "Срібні запонки 925 проби ручної роботи", estCost: 1100 },
				{ name: "Класичний годинник у надтонкому сталевому корпусі", estCost: 1850 },
				{ name: "Дерев'яний футляр із велюровою оббивкою", estCost: 450 }
			],
			price: 3400,
			currency: "грн",
			image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80"
		}
	];

	// 3.1. Синхронізація з LocalStorage (єдине джерело правди для каталогу та адмін-панелі)
	const STORAGE_KEY = 'gift_constructor_catalog';

	function initCatalogFromStorage() {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed) && parsed.length > 0) {
					giftsCatalog = parsed;
					return;
				}
			} catch (e) {
				console.warn('Помилка читання LocalStorage в script.js:', e);
			}
		}

		// Завантаження актуальної бази з gifts.json якщо LocalStorage ще не заповнено
		fetch('./gifts.json')
			.then(res => {
				if (res.ok) return res.json();
				throw new Error('Network response not ok');
			})
			.then(data => {
				if (Array.isArray(data) && data.length > 0) {
					giftsCatalog = data;
					try {
						localStorage.setItem(STORAGE_KEY, JSON.stringify(giftsCatalog));
					} catch (e) {}
				}
			})
			.catch(() => {
				// Зберігаємо резервний вбудований каталог у LocalStorage
				try {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(giftsCatalog));
				} catch (e) {}
			});
	}

	initCatalogFromStorage();

	// Слухач синхронізації між вкладками браузера
	window.addEventListener('storage', (e) => {
		if (e.key === STORAGE_KEY && e.newValue) {
			try {
				const updated = JSON.parse(e.newValue);
				if (Array.isArray(updated) && updated.length > 0) {
					giftsCatalog = updated;
				}
			} catch (err) {}
		}
	});

	// 4. Очищення помилок під час вводу
	[recipientSelect, occasionSelect, budgetInput].forEach(element => {
		if (element) {
			element.addEventListener('input', () => {
				element.classList.remove('invalid');
				if (recipientSelect.value && occasionSelect.value && budgetInput.value > 0) {
					errorMessage.style.display = 'none';
				}
			});
		}
	});

	// 5. Алгоритм підбору подарунка відповідно до бюджету та критеріїв
	function findBestGift(recipient, occasion, budget) {
		// Визначаємо цінову категорію за бюджетом
		let targetTier = 'optimal';
		if (budget <= 300) {
			targetTier = 'mini';      // 50 - 300 грн: пряник, листівка з чаєм, шоколадка, брелок
		} else if (budget <= 900) {
			targetTier = 'standard';  // 301 - 900 грн: кардхолдер, кава, свічка, квіти
		} else if (budget < 2500) {
			targetTier = 'optimal';   // 901 - 2400 грн: СПА-бокс, гаманець+ремінь, худі, термос
		} else {
			targetTier = 'premium';   // >= 2500 грн: шовк+парфуми, годинник, кришталь, запонки
		}

		// 1. Шукаємо точний збіг у цільовій категорії
		const tierGifts = giftsCatalog.filter(g => g.tier === targetTier);

		let candidates = tierGifts.filter(g =>
			(g.recipient === recipient || g.recipient === 'Всі') &&
			(g.occasion === occasion || g.occasion === 'Всі')
		);

		// 2. Якщо точного збігу події немає, шукаємо за отримувачем у цій же категорії
		if (candidates.length === 0) {
			candidates = tierGifts.filter(g => g.recipient === recipient || g.recipient === 'Всі');
		}

		// 3. Якщо і цього немає, шукаємо за подією у цій категорії
		if (candidates.length === 0) {
			candidates = tierGifts.filter(g => g.occasion === occasion || g.occasion === 'Всі');
		}

		// 4. Якщо все ще немає — беремо будь-який подарунок із цієї категорії
		if (candidates.length === 0 && tierGifts.length > 0) {
			candidates = tierGifts;
		}

		// 5. Загальний fallback — весь каталог
		if (candidates.length === 0) {
			candidates = giftsCatalog;
		}

		// Обираємо подарунок, ціна якого найближча до бюджету
		candidates.sort((a, b) => Math.abs(a.price - budget) - Math.abs(b.price - budget));
		return candidates[0];
	}

	// 6. Обробка відправки форми
	form.addEventListener('submit', (e) => {
		e.preventDefault();

		const recipient = recipientSelect.value;
		const occasion = occasionSelect.value;
		const budget = parseFloat(budgetInput.value);

		let hasError = false;

		if (!recipient) {
			recipientSelect.classList.add('invalid');
			hasError = true;
		} else {
			recipientSelect.classList.remove('invalid');
		}

		if (!occasion) {
			occasionSelect.classList.add('invalid');
			hasError = true;
		} else {
			occasionSelect.classList.remove('invalid');
		}

		if (!budget || budget <= 0 || isNaN(budget)) {
			budgetInput.classList.add('invalid');
			hasError = true;
		} else {
			budgetInput.classList.remove('invalid');
		}

		if (hasError) {
			errorMessage.style.display = 'block';
			errorMessage.textContent = '⚠️ Будь ласка, заповніть усі поля форми!';
			return;
		}

		errorMessage.style.display = 'none';
		renderResultCard(recipient, occasion, budget);
	});

	// 7. Відображення єдиної картки подарунка
	function renderResultCard(recipient, occasion, budget) {
		const gift = findBestGift(recipient, occasion, budget);
		const occasionFull = occasionLabels[occasion] || occasion;

		// Формуємо список складових набору
		let itemsHtml = '';
		if (gift.items && gift.items.length > 0) {
			const itemsList = gift.items.map(item =>
				`<li><span>${item.name}</span> <strong>${item.estCost.toLocaleString('uk-UA')} грн</strong></li>`
			).join('');
			itemsHtml = `
				<div style="margin: 0.6rem 0 0.3rem 0; font-size: 0.85rem; font-weight: 600; color: #334155;">
					📦 Реальний склад набору:
				</div>
				<ul class="card-items-list">
					${itemsList}
				</ul>
			`;
		}

		// Статус порівняння з бюджетом користувача
		let budgetNote = '';
		if (gift.price <= budget) {
			const diff = budget - gift.price;
			const diffText = diff > 0 ? ` (залишок: ${diff.toLocaleString('uk-UA')} грн)` : ` (точне попадання)`;
			budgetNote = `<div class="budget-status-note fit">✅ Вписується у ваш бюджет ${budget.toLocaleString('uk-UA')} грн${diffText}</div>`;
		} else {
			const diff = gift.price - budget;
			budgetNote = `<div class="budget-status-note above">💡 Набір перевищує зазначений бюджет на ${diff.toLocaleString('uk-UA')} грн</div>`;
		}

		resultCard.innerHTML = `
			<div class="card-badge">${gift.badge}</div>
			<img src="${gift.image}" alt="${gift.title}">
			<div class="card-body">
				<div class="card-target-tag">👤 Для: <strong>${recipient}</strong> • ${occasionFull}</div>
				<h3>${gift.title}</h3>
				<p>${gift.description}</p>
				${itemsHtml}
				<div class="card-footer">
					<div class="card-price">Реальна вартість: <strong>${gift.price.toLocaleString('uk-UA')} грн</strong></div>
				</div>
				${budgetNote}
			</div>
		`;

		if (emptyStateContent) {
			emptyStateContent.style.display = 'none';
		}

		resultCard.style.display = 'flex';
		rezultatContainer.classList.remove('empty-state');
	}

	// 8. Обробка кнопки «Скинути» форми конструктора
	const resetBtn = document.getElementById('resetBtn');
	if (resetBtn) {
		resetBtn.addEventListener('click', () => {
			form.reset();
			[recipientSelect, occasionSelect, budgetInput].forEach(el => {
				if (el) el.classList.remove('invalid');
			});
			errorMessage.style.display = 'none';
			if (emptyStateContent) {
				emptyStateContent.style.display = 'block';
			}
			if (resultCard) {
				resultCard.style.display = 'none';
				resultCard.innerHTML = '';
			}
			if (rezultatContainer) {
				rezultatContainer.classList.add('empty-state');
			}
		});
	}
});
