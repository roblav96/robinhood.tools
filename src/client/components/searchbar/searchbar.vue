<!--  -->
<script lang="ts" src="./searchbar.ts"></script>

<style>
/**/

#searchbar div.dropdown-content {
	max-width: 75vw;
	max-height: 75vh;
}

#searchbar a.dropdown-item.is-hovered,
#searchbar a.dropdown-item:hover {
	color: inherit;
}

#searchbar a.dropdown-item.is-hovered .title,
#searchbar a.dropdown-item:hover .title {
	color: var(--primary);
}

#searchbar div.dropdown-item:not(.is-disabled) {
	border-bottom: 1px solid var(--border);
	padding: 0px 1rem;
	padding-bottom: 0.5rem;
}

#searchbar div.dropdown-item:empty {
	display: none;
}

</style>

<template>
	<b-field id="searchbar">
		<b-autocomplete ref="searchbar_autocomplete" open-on-focus clear-on-select :keep-first="!!query" type="search" placeholder="Search..."
		    icon="magnify" v-model="query" :data="results" v-on:focus="onfocus" v-on:blur="onblur" v-on:input="oninput"
		    v-on:select="onselect">
			<template v-if="!query" slot="header">
				<span class="has-text-lighter is-size-6">Recently Viewed</span>
			</template>
			<template slot="empty">No results found...</template>
			<template slot-scope="props">
				<div class="columns is-mobile is-gapless items-center">
					<div class="column is-narrow mr-4">
						<v-symbol-logo class="is-32x32 shadow" :symbol="props.option.symbol"></v-symbol-logo>
					</div>
					<div class="column">
						<p class="title is-size-5">{{props.option.symbol}}</p>
						<p class="subtitle is-size-6">{{props.option.tinyName||props.option.name}}</p>
					</div>
				</div>
			</template>
		</b-autocomplete>
	</b-field>
</template>
