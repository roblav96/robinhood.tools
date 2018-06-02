<!--  -->
<script lang="ts" src="./searchbar.ts"></script>

<style>
/**/

div.searchbar div.dropdown-content {
	max-width: 75vw;
	max-height: 75vh;
}

div.searchbar a.dropdown-item.is-hovered,
div.searchbar a.dropdown-item:hover {
	color: inherit;
}

div.searchbar a.dropdown-item.is-hovered .title,
div.searchbar a.dropdown-item:hover .title {
	color: var(--primary);
}

div.searchbar div.dropdown-item:not(.is-disabled) {
	border-bottom: 2px solid var(--border);
	padding: 0px 1rem;
	padding-bottom: 0.5rem;
}

div.searchbar div.dropdown-item:empty {
	display: none;
}

</style>

<template>
	<b-autocomplete class="searchbar" ref="searchbar_input" open-on-focus keep-first type="search" placeholder="Search..."
	    icon="magnify" v-model="query" :data="results" v-on:focus="onfocus" v-on:blur="onblur" v-on:input="oninput"
	    v-on:select="onselect">
		<template v-if="!query" slot="header">
			<p>
				<b-icon class="align-middle mr-5 ml-1" icon="history"></b-icon>
				<span class="align-middle font-bold is-size-6">Recently Viewed</span>
			</p>
		</template>
		<template slot="empty">No results found...</template>
		<template slot-scope="props">
			<div class="columns is-mobile is-gapless">
				<div class="column is-narrow self-center mr-4">
					<symbol-logo class="is-32x32 shadow" :symbol="props.option.symbol"></symbol-logo>
				</div>
				<div class="column">
					<p class="title is-size-5 mr-1">{{props.option.symbol}}</p>
					<p class="subtitle is-size-6">{{vtruncate(props.option.name)}}</p>
				</div>
			</div>
		</template>
	</b-autocomplete>
</template>
