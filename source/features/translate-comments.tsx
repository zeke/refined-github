import delegate from 'delegate-it';
import React from 'dom-chef';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import {GlobeIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';

console.log('translate comments...')

async function translateComment () {
	console.log('translateComment!')
	const url = 'https://html-translator.herokuapp.com/translate?text=hello,%20world'
	const request = await fetch(url);
	const response = await request.json();
	console.log({response})
}

function init(): void {
	console.log('translate comments init()')
	// Find editable comments first, then traverse to the correct position
	observe('.js-comment.unminimized-comment .js-comment-update:not(.rgh-translate-comment)', {
		add(comment) {
			// comment.classList.add('rgh-translate-comment');

			comment
				.closest('.js-comment')!
				.querySelector('.timeline-comment-actions > details:last-child')! // The dropdown
				.before(
					<button
						type="button"
						role="menuitem"
						className="timeline-comment-action btn-link rgh-translate-comment"
						aria-label="Translate comment"
					>
						<GlobeIcon/>
					</button>
				);
		}
	});

	delegate(document, '.rgh-translate-comment', 'click', translateComment);
}


void features.add(__filebasename, {
	include: [
		pageDetect.hasComments
	],
	init: onetime(init)
});
