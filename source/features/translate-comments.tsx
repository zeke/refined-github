import delegate from 'delegate-it';
import React from 'dom-chef';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import {GlobeIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import features from '.';

async function translateComment (event: delegate.Event<MouseEvent, HTMLButtonElement>) {
	const comment = event.delegateTarget.closest<HTMLElement>('.timeline-comment')!
	const commentBody = comment!.querySelector('.edit-comment-hide .markdown-body')
	const text = commentBody!.outerHTML
	const url = 'https://html-translator.herokuapp.com/translate'

	// Determine target languages by pulling non-English codes from navigator.languages
	// Microsoft Translator expects language codes in 2-letter BCP47 format
	const languageCodes = navigator.languages.map(l => l.slice(0, 2).toLowerCase())
	const languages = languageCodes
		.filter((code, i) => languageCodes.indexOf(code) === i)
		.filter(code => code !== 'en')

	// Hit the translation webservice
  const request = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {'Content-Type': 'application/json'},
    redirect: 'follow',
    body: JSON.stringify({text, languages})
  })

	const response = await request.json()
	
	// Inject translations into the DOM
	if (commentBody) {
		for (const translation of response.translations) {
			{ /* eslint-disable-next-line react/no-danger */ }
			commentBody.before(<td dangerouslySetInnerHTML={{__html: translation.text}} className="d-block comment-body markdown-body js-comment-body rgh-linkified-code" />)
			commentBody.before(<hr/>)
		}
	}
}

function init(): void {
	observe('.timeline-comment', {
		add(comment) {
			// Add a globe button to the comment
			const subComment = comment.closest('.js-comment')!
			if (!subComment) return
			const details = subComment.querySelector('.timeline-comment-actions > details:last-child')! // The dropdown
			if (!details) return

			details.before(
				<button
					type="button"
					role="menuitem"
					className="timeline-comment-action btn-link rgh-translate-comment"
					aria-label="Translate comment"
				>
					<GlobeIcon/>
				</button>
			)
		}
	});

	// Invoke translation when the globe button is clicked
	delegate(document, '.rgh-translate-comment', 'click', translateComment);
}


void features.add(__filebasename, {
	include: [
		pageDetect.hasComments
	],
	init: onetime(init)
});
