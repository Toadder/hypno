// Form Check
const formCheck = () => {
	// Form Validation & Send
	const forms = document.querySelectorAll('form');
	for (var i = 0; i < forms.length; i++) {
		form = forms[i];

		form.addEventListener('submit', formSend);
	}
	async function formSend(e) {
		e.preventDefault();

		let error = formValidate(form);

		if (error === 0) {
			// ОТПРАВКА ФОРМЫ
		}
	}
	function formValidate(form) {
		let error = 0;
		let formReq = form.querySelectorAll('.req');

		for (var i = 0; i < formReq.length; i++) {
			const input = formReq[i];
			formRemoveError(input);

			if (input.classList.contains('_email')) {
				if (!emailTest(input)) {
					formAddError(input);
					error++;
				}
			} else if (input.value == '') {
				formAddError(input);
				error++;
			}
		}
	}

	const formAddError = el => {
		el.classList.add('_error');
		el.parentElement.classList.add('_error');
	};

	const formRemoveError = el => {
		el.classList.remove('_error');
		el.parentElement.classList.remove('_error');
	};

	// Валидация Email
	const emailTest = input => {
		const re =
			/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(input.value);
	};

	// Валидация имени (только русские и английские символы)
	const nameTest = input => {
		const re = /^[a-zа-яё\s]+$/iu;

		return re.test(input.value);
	};
};

// Phone mask
const phoneMask = () => {
	let phoneInputs = document.querySelectorAll('input[data-tel-input]');

	for (let phoneInput of phoneInputs) {
		phoneInput.addEventListener('keydown', onPhoneKeyDown);
		phoneInput.addEventListener('input', onPhoneInput, false);
		phoneInput.addEventListener('paste', onPhonePaste, false);
	}

	function getInputNumbersValue(input) {
		// Return stripped input value — just numbers
		return input.value.replace(/\D/g, '');
	}

	function onPhonePaste(e) {
		let input = e.target,
			inputNumbersValue = getInputNumbersValue(input);
		let pasted = e.clipboardData || window.clipboardData;
		if (pasted) {
			let pastedText = pasted.getData('Text');
			if (/\D/g.test(pastedText)) {
				// Attempt to paste non-numeric symbol — remove all non-numeric symbols,
				// formatting will be in onPhoneInput handler
				input.value = inputNumbersValue;
				return;
			}
		}
	}

	function onPhoneInput(e) {
		let input = e.target,
			inputNumbersValue = getInputNumbersValue(input),
			selectionStart = input.selectionStart,
			formattedInputValue = '';

		if (!inputNumbersValue) {
			return (input.value = '');
		}

		if (input.value.length != selectionStart) {
			// Editing in the middle of input, not last symbol
			if (e.data && /\D/g.test(e.data)) {
				// Attempt to input non-numeric symbol
				input.value = inputNumbersValue;
			}
			return;
		}

		if (['7', '8', '9'].indexOf(inputNumbersValue[0]) > -1) {
			if (inputNumbersValue[0] == '9')
				inputNumbersValue = '7' + inputNumbersValue;
			let firstSymbols = inputNumbersValue[0] == '8' ? '8' : '+7';
			formattedInputValue = input.value = firstSymbols + ' ';
			if (inputNumbersValue.length > 1) {
				formattedInputValue += '(' + inputNumbersValue.substring(1, 4);
			}
			if (inputNumbersValue.length >= 5) {
				formattedInputValue += ') ' + inputNumbersValue.substring(4, 7);
			}
			if (inputNumbersValue.length >= 8) {
				formattedInputValue += '-' + inputNumbersValue.substring(7, 9);
			}
			if (inputNumbersValue.length >= 10) {
				formattedInputValue += '-' + inputNumbersValue.substring(9, 11);
			}
		} else {
			formattedInputValue = '+' + inputNumbersValue.substring(0, 16);
		}
		input.value = formattedInputValue;
	}

	function onPhoneKeyDown(e) {
		// Clear input after remove last symbol
		let inputValue = e.target.value.replace(/\D/g, '');
		if (e.keyCode == 8 && inputValue.length == 1) {
			e.target.value = '';
		}
	}
};

// Spoilers
const spoilers = (blockWithSpoilers, accordion = true, duration = 500) => {
	const block = blockWithSpoilers,
		spoilersArray = block.querySelectorAll('[data-spoiler]');

	if (spoilersArray.length > 0) {
		for (let index = 0; index < spoilersArray.length; index++) {
			const spoiler = spoilersArray[index];

			spoiler.addEventListener('click', e => {
				const spoilerBody = spoiler.nextElementSibling;

				if (!block.querySelectorAll('.slide').length) {
					if (accordion && !spoiler.classList.contains('_active')) {
						hideSpoilerBody();
					}
					spoiler.classList.toggle('_active');
					spoiler.parentElement.classList.toggle('_active');
					_slideToggle(spoilerBody, duration);
				}
				e.preventDefault();
			});
		}
	}

	function hideSpoilerBody() {
		const activeSpoiler = block.querySelector('[data-spoiler].active');
		if (activeSpoiler) {
			activeSpoiler.classList.remove('_active');
			activeSpoiler.parentElement.classList.remove('_active');
			_slideUp(activeSpoiler.nextElementSibling, duration);
		}
	}
};

/* SLIDE UP */
const _slideUp = (target, duration = 500) => {
	if (!target.classList.contains('_slide')) {
		target.classList.add('_slide');
		target.style.transitionProperty = 'height, margin, padding';
		target.style.transitionDuration = duration + 'ms';
		target.style.boxSizing = 'border-box';
		target.style.height = target.offsetHeight + 'px';
		target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = 0;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		window.setTimeout(() => {
			target.style.display = 'none';
			target.style.removeProperty('height');
			target.style.removeProperty('padding-top');
			target.style.removeProperty('padding-bottom');
			target.style.removeProperty('margin-top');
			target.style.removeProperty('margin-bottom');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			target.classList.remove('_slide');
		}, duration);
	}
};

/* SLIDE DOWN */
const _slideDown = (target, duration = 500) => {
	if (!target.classList.contains('_slide')) {
		target.classList.add('_slide');
		target.style.removeProperty('display');
		let display = window.getComputedStyle(target).display;
		if (display === 'none') display = 'block';
		target.style.display = display;
		let height = target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = 0;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		target.offsetHeight;
		target.style.boxSizing = 'border-box';
		target.style.transitionProperty = 'height, margin, padding';
		target.style.transitionDuration = duration + 'ms';
		target.style.height = height + 'px';
		target.style.removeProperty('padding-top');
		target.style.removeProperty('padding-bottom');
		target.style.removeProperty('margin-top');
		target.style.removeProperty('margin-bottom');
		window.setTimeout(() => {
			target.style.removeProperty('height');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			target.classList.remove('_slide');
		}, duration);
	}
};

/* TOOGLE */
const _slideToggle = (target, duration = 500) => {
	if (window.getComputedStyle(target).display === 'none') {
		return _slideDown(target, duration);
	} else {
		return _slideUp(target, duration);
	}
};