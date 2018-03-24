// 

import * as Vts from 'vue-property-decorator'
import { mixins as Mixins } from 'vue-class-component'
import Vue from 'vue'
import * as core from '@/common/core'



@Vts.Component
export default class extends Vue {

	stylesheets = [] as { title: string, styles: string }[]

	mounted() {
		Array.from(document.head.children).filter(el => {
			return el.tagName == 'STYLE' && el.innerHTML.includes('/*_block_*/')
		}).forEach(el => {
			let blocks = el.innerHTML.split('/*_block_*/').map(v => v.trim())
			blocks.filter(v => v.includes('█')).forEach(block => {
				let split = block.split('\n')
				let title = core.string.capitalizeWords(core.string.clean(split.shift()))
				let styles = split.join('\n').split('\n/*! bulma.io').shift()
				styles = styles.replace(/ !important;/g, ';')
				// styles = styles.replace(/\n  /g, '\n    ')
				// styles = styles.replace(/}\n./g, '}\n\n.')
				this.stylesheets.push({ title, styles })
			})
		})
		this.stylesheets.sort((a, b) => core.array.sortAlphabetically(a.title, b.title))
	}

}


