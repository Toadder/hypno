// Device type
const isMobile = {
	Android: function () {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry: function () {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS: function () {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera: function () {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows: function () {
		return (
			navigator.userAgent.match(/IEMobile/i) ||
			navigator.userAgent.match(/WPDesktop/i)
		);
	},
	any: function () {
		return (
			isMobile.Android() ||
			isMobile.BlackBerry() ||
			isMobile.iOS() ||
			isMobile.Opera() ||
			isMobile.Windows()
		);
	},
};

// Media Queries
const mobileMediaQuery = window.matchMedia('(max-width: 767.98px)');

// Helpers
const fadeIn = (el, timeout, display) => {
	el.style.opacity = 0;
	el.style.display = display || 'block';
	el.style.transition = `opacity ${timeout}ms`;
	setTimeout(() => {
		el.style.opacity = 1;
	}, 10);
};

const fadeOut = (el, timeout) => {
	el.style.opacity = 1;
	el.style.transition = `opacity ${timeout}ms`;
	el.style.opacity = 0;

	setTimeout(() => {
		el.style.display = 'none';
	}, timeout);
};

const removeClass = (array, removedClass) => {
	for (let el of array) {
		el.classList.remove(removedClass);
	}
};

/**
 * @typedef {Object} dNode
 * @property {HTMLElement} parent
 * @property {HTMLElement} element
 * @property {HTMLElement} to
 * @property {string} breakpoint
 * @property {string} order
 * @property {number} index
 */

/**
 * @typedef {Object} dMediaQuery
 * @property {string} query
 * @property {number} breakpoint
 */

/**
 * @param {'min' | 'max'} type
 */
export function useDynamicAdapt(type = 'max') {
	const className = '_dynamic_adapt_';
	const attrName = 'data-da';

	/** @type {dNode[]} */
	const dNodes = getDNodes();

	/** @type {dMediaQuery[]} */
	const dMediaQueries = getDMediaQueries(dNodes);

	dMediaQueries.forEach(dMediaQuery => {
		const matchMedia = window.matchMedia(dMediaQuery.query);
		// массив объектов с подходящим брейкпоинтом
		const filteredDNodes = dNodes.filter(
			({ breakpoint }) => breakpoint === dMediaQuery.breakpoint
		);
		const mediaHandler = getMediaHandler(matchMedia, filteredDNodes);
		matchMedia.addEventListener('change', mediaHandler);

		mediaHandler();
	});

	function getDNodes() {
		const result = [];
		const elements = [...document.querySelectorAll(`[${attrName}]`)];

		elements.forEach(element => {
			const attr = element.getAttribute(attrName);
			const [toSelector, breakpoint, order] = attr
				.split(',')
				.map(val => val.trim());

			const to = document.querySelector(toSelector);

			if (to) {
				result.push({
					parent: element.parentElement,
					element,
					to,
					breakpoint: breakpoint ?? '767',
					order:
						order !== undefined
							? isNumber(order)
								? Number(order)
								: order
							: 'last',
					index: -1,
				});
			}
		});

		return sortDNodes(result);
	}

	/**
	 * @param {dNode} items
	 * @returns {dMediaQuery[]}
	 */
	function getDMediaQueries(items) {
		const uniqItems = [
			...new Set(
				items.map(
					({ breakpoint }) => `(${type}-width: ${breakpoint}px),${breakpoint}`
				)
			),
		];

		return uniqItems.map(item => {
			const [query, breakpoint] = item.split(',');

			return { query, breakpoint };
		});
	}

	/**
	 * @param {MediaQueryList} matchMedia
	 * @param {dNodes} items
	 */
	function getMediaHandler(matchMedia, items) {
		return function mediaHandler() {
			if (matchMedia.matches) {
				items.forEach(item => {
					moveTo(item);
				});

				items.reverse();
			} else {
				items.forEach(item => {
					if (item.element.classList.contains(className)) {
						moveBack(item);
					}
				});

				items.reverse();
			}
		};
	}

	/**
	 * @param {dNode} dNode
	 */
	function moveTo(dNode) {
		const { to, element, order } = dNode;
		dNode.index = getIndexInParent(dNode.element, dNode.element.parentElement);
		element.classList.add(className);

		if (order === 'last' || order >= to.children.length) {
			to.append(element);

			return;
		}

		if (order === 'first') {
			to.prepend(element);

			return;
		}

		to.children[order].before(element);
	}

	/**
	 * @param {dNode} dNode
	 */
	function moveBack(dNode) {
		const { parent, element, index } = dNode;
		element.classList.remove(className);

		if (index >= 0 && parent.children[index]) {
			parent.children[index].before(element);
		} else {
			parent.append(element);
		}
	}

	/**
	 * @param {HTMLElement} element
	 * @param {HTMLElement} parent
	 */
	function getIndexInParent(element, parent) {
		return [...parent.children].indexOf(element);
	}

	/**
	 * Функция сортировки массива по breakpoint и order
	 * по возрастанию для type = min
	 * по убыванию для type = max
	 *
	 * @param {dNode[]} items
	 */
	function sortDNodes(items) {
		const isMin = type === 'min' ? 1 : 0;

		return [...items].sort((a, b) => {
			if (a.breakpoint === b.breakpoint) {
				if (a.order === b.order) {
					return 0;
				}

				if (a.order === 'first' || b.order === 'last') {
					return -1 * isMin;
				}

				if (a.order === 'last' || b.order === 'first') {
					return 1 * isMin;
				}

				return 0;
			}

			return (a.breakpoint - b.breakpoint) * isMin;
		});
	}

	function isNumber(value) {
		return !isNaN(value);
	}
}

// Header events
const header = document.querySelector('.header');
const headerBurger = header?.querySelector('.header__burger');
const headerMenu = header?.querySelector('.header__outer');

const headerHandler = () => {
	if (!header) return;

	headerBurger.addEventListener('click', () => {
		headerBurger.classList.toggle('header__burger_active');
		headerMenu.classList.toggle('header__outer_active');
	});
};

// UI Helper in programmes & reviews sections
const heightBlocksHandler = (...arrays) => {
	const reviewsNames = Array.from(
		document.querySelectorAll('.item-reviews__title')
	);
	const programmeNames = Array.from(
		document.querySelectorAll('.js-same-height')
	);

	const data = [
		{ items: reviewsNames, mediaQuery: 767.98 },
		{ items: programmeNames, mediaQuery: 991.98 },
	];

	for (let index = 0; index < data.length; index++) {
		const { items, mediaQuery } = data[index];

		if (!items.length || window.innerWidth <= mediaQuery) continue;

		const itemsHeight = items.map(item => item.clientHeight);
		const maxHeight = Math.max(...itemsHeight);

		items.forEach(item => (item.style.minHeight = `${maxHeight}px`));
	}
};

// Swiper sliders
const reviewsSliderBlock = document.querySelector('.reviews__slider');
const tariffsSliderBlock = document.querySelector('.tariffs__slider');
const diplomasSliderBlock = document.querySelector('.slider-diplomas');

const slidersInit = () => {
	if (reviewsSliderBlock) {
		let reviewsSlider,
			init = false;

		const initReviewsSlider = () => {
			if (mobileMediaQuery.matches && !init) {
				init = true;
				reviewsSlider = new Swiper('.reviews__slider', {
					slidesPerView: 1,
					loop: true,
					speed: 700,
					spaceBetween: 15,
					autoHeight: true,
					grabCursor: true,
					navigation: {
						prevEl: '.reviews__prev',
						nextEl: '.reviews__next',
					},
				});
			} else if (!mobileMediaQuery.matches && reviewsSlider) {
				reviewsSlider.destroy();
				init = false;
			}
		};

		initReviewsSlider();
		window.addEventListener('resize', initReviewsSlider);
	}

	if (tariffsSliderBlock) {
		new Swiper('.tariffs__slider', {
			slidesPerView: 1,
			loop: true,
			speed: 600,
			grabCursor: true,
			autoHeight: true,
			effect: 'fade',
			fadeEffect: {
				crossFade: true,
			},
			navigation: {
				prevEl: '.tariffs__prev',
				nextEl: '.tariffs__next',
			},
		});
	}

	if (diplomasSliderBlock) {
		new Swiper('.slider-diplomas', {
			effect: 'coverflow',
			speed: 400,
			grabCursor: true,
			centeredSlides: true,
			initialSlide: 1,
			slidesPerView: 'auto',
			coverflowEffect: {
				rotate: 0,
				stretch: 0,
				depth: 700,
				modifier: 1,
				slideShadows: false,
			},
			navigation: {
				prevEl: '.diplomas__prev',
				nextEl: '.diplomas__next',
			},
			pagination: {
				clickable: true,
				el: '.diplomas__pagination',
				bulletClass: 'diplomas__bullet',
				bulletActiveClass: 'diplomas__bullet_active',
			},
		});
	}
};

// Video handler
const videosHandler = () => {
	const videoBlocks = document.querySelectorAll('.video');

	for (let index = 0; index < videoBlocks.length; index++) {
		const currentVideoBlock = videoBlocks[index];
		const video = currentVideoBlock.querySelector('video');
		const overlay = currentVideoBlock.querySelector('.video__overlay');
		const play = currentVideoBlock.querySelector('.video__play');

		const timeTracking = {
			watchedTime: 0,
			currentTime: 0,
		};
		let lastUpdated = 'currentTime';

		play.addEventListener(
			'click',
			() => {
				overlay.classList.add('video__overlay_clicked');
				if (!isMobile.any()) {
					video.requestFullscreen();
				}
				video.play();
				setTimeout(() => (video.controls = true), 350);
			},
			{ once: true }
		);

		video.addEventListener('timeupdate', () => {
			if (!video.seeking) {
				if (video.currentTime > timeTracking.watchedTime) {
					timeTracking.watchedTime = video.currentTime;
					lastUpdated = 'watchedTime';
				} else {
					timeTracking.currentTime = video.currentTime;
					lastUpdated = 'currentTime';
				}
			}
		});

		video.addEventListener('seeking', function () {
			const delta = video.currentTime - timeTracking.watchedTime;
			if (delta > 0) {
				video.pause();
				video.currentTime = timeTracking[lastUpdated];
				video.play();
			}
		});
	}
};

// Popup Handler
const popupHandler = () => {
	const popupLinks = document.querySelectorAll('.popup-link');
	const body = document.querySelector('body');
	const lockPadding = document.querySelectorAll('.lock-padding');
	let unlock = true;
	const timeout = 400;

	if (!popupLinks.length) return;

	for (let index = 0; index < popupLinks.length; index++) {
		const popupLink = popupLinks[index];
		popupLink.addEventListener('click', function (e) {
			const popupName = popupLink.getAttribute('href').replace('#', '');
			const currentPopup = document.getElementById(popupName);
			popupOpen(currentPopup);
			e.preventDefault();
		});
	}

	const popupCloseIcon = document.querySelectorAll('.close-popup');
	if (popupCloseIcon.length > 0) {
		for (let index = 0; index < popupCloseIcon.length; index++) {
			const el = popupCloseIcon[index];
			el.addEventListener('click', function (e) {
				popupClose(el.closest('.popup'));
				e.preventDefault();
			});
		}
	}

	function popupOpen(currentPopup) {
		if (currentPopup && unlock) {
			const popupActive = document.querySelector('.popup.open');
			if (popupActive) {
				popupClose(popupActive, false);
			} else {
				bodyLock();
			}
			currentPopup.classList.add('open');
			currentPopup.addEventListener('click', function (e) {
				if (!e.target.closest('.popup__content')) {
					popupClose(e.target.closest('.popup'));
				}
			});
		}
	}

	function popupClose(popupActive, doUnlock = true) {
		if (unlock) {
			popupActive.classList.remove('open');
			if (doUnlock) {
				bodyUnlock();
			}
		}
	}

	function bodyLock() {
		const lockPaddingValue =
			window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';

		if (lockPadding.length > 0) {
			for (let index = 0; index < lockPadding.length; index++) {
				const el = lockPadding[index];
				el.style.paddingRight = lockPaddingValue;
			}
		}
		body.style.paddingRight = lockPaddingValue;
		body.classList.add('lock');

		unlock = false;
		setTimeout(function () {
			unlock = true;
		}, timeout);
	}

	function bodyUnlock() {
		setTimeout(function () {
			if (lockPadding.length > 0) {
				for (let index = 0; index < lockPadding.length; index++) {
					const el = lockPadding[index];
					el.style.paddingRight = '0px';
				}
			}
			body.style.paddingRight = '0px';
			body.classList.remove('lock');
		}, timeout);

		unlock = false;
		setTimeout(function () {
			unlock = true;
		}, timeout);

		document.addEventListener('keydown', function (e) {
			if (e.code === 'Escape') {
				const popupActive = document.querySelector('.popup.open');
				popupClose(popupActive);
			}
		});
	}
};

// Tabs
const tabsInit = () => {
	const tabsParents = document.querySelectorAll('[data-tabs]');

	for (let index = 0; index < tabsParents.length; index++) {
		const tabsParent = tabsParents[index];

		tabStart(tabsParent);
	}
};

function tabStart(tabsParent) {
	const tabs = Array.from(tabsParent.querySelectorAll('.tabs__tab'));
	const contents = tabsParent.querySelectorAll('.contents__content');

	for (let index = 0; index < tabs.length; index++) {
		const tab = tabs[index];

		tab.addEventListener('click', () => {
			const index = tabs.indexOf(tab);

			removeClass(tabs, 'tabs__tab_active');
			removeClass(contents, 'contents__content_active');

			tab.classList.add('tabs__tab_active');
			contents[index].classList.add('contents__content_active');
		});
	}
}

// Anchor scroll
const anchorScrollInit = () => {
	const links = document.querySelectorAll('a.anchor-scroll');

	for (let index = 0; index < links.length; index++) {
		const link = links[index];

		link.addEventListener('click', e => {
			e.preventDefault();

			const href = link.getAttribute('href').replace('#', ''),
				scrollTarget = document.getElementById(href),
				topOffset = header.offsetHeight,
				elementPosition = scrollTarget?.getBoundingClientRect().top,
				offsetPosition = elementPosition - topOffset;

			if (!scrollTarget) {
				window.location.href = '/';
			}

			headerBurger.classList.remove('header__burger_active');
			headerMenu.classList.remove('header__outer_active');

			window.scrollBy({
				top: offsetPosition,
				behavior: 'smooth',
			});
		});
	}
};

// Fears Loading
const fearsLoading = () => {
	const ITEMS_TO_LOAD = 3;
	const fearsBlock = document.querySelector('.fears');
	const fearsItems = Array.from(document.querySelectorAll('.item-fears'));
	const fearsLoad = document.querySelector('.fears__loadmore');
	const fearsHide = document.querySelector('.fears__hide');

	let countShownItems = ITEMS_TO_LOAD;

	if (!fearsBlock || !fearsItems.length || !fearsLoad || !fearsHide) return;

	if (fearsItems.length <= ITEMS_TO_LOAD) {
		fearsLoad.style.display = 'none';
		return;
	}

	fearsLoad.addEventListener('click', () => {
		const startIndex = countShownItems,
			endIndex = countShownItems + ITEMS_TO_LOAD;
		const itemsToShow = fearsItems.filter(
			(_, index) => index >= startIndex && index < endIndex
		);

		for (const item of itemsToShow) fadeIn(item, 1000);

		countShownItems += itemsToShow.length;
		if (countShownItems === fearsItems.length) {
			fearsLoad.style.display = 'none';
			fearsHide.style.display = 'flex';
		}
	});

	fearsHide.addEventListener('click', () => {
		const topOffset = header.offsetHeight,
			elementPosition = fearsBlock.getBoundingClientRect().top,
			offsetPosition = elementPosition - topOffset;

		const itemsToShow = fearsItems.filter((_, index) => index >= ITEMS_TO_LOAD);
		for (const item of itemsToShow) fadeOut(item, 1000);

		countShownItems = ITEMS_TO_LOAD;
		fearsLoad.style.display = 'flex';
		fearsHide.style.display = 'none';

		window.scrollBy({
			top: offsetPosition,
			behavior: 'smooth',
		});
	});
};

// Lazy Loading
const lazyloading = () => {
	const lazyImages = document.querySelectorAll('[data-src]');

	if (lazyImages) {
		const imageObserver = new IntersectionObserver(
			(entries, imgObserver) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						const lazyImage = entry.target;
						lazyImage.src = lazyImage.dataset.src;
						imgObserver.unobserve(lazyImage);
					}
				});
			},
			{
				root: null,
				threshold: 0.1,
			}
		);

		lazyImages.forEach(image => imageObserver.observe(image));
	}
};

document.addEventListener('DOMContentLoaded', () => {
	headerHandler();
	lazyloading();
	useDynamicAdapt();
	popupHandler();
	tabsInit();
	fearsLoading();
});

// Initialize functions
const init = () => {
	anchorScrollInit();
	slidersInit();
	videosHandler();
	heightBlocksHandler();
};

window.onload = init;
