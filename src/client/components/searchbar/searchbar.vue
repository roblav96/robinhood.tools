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

</style>

<template>
	<b-autocomplete class="searchbar" ref="searchbar_input" open-on-focus keep-first type="search" placeholder="Search..."
	    icon="magnify" v-model="query" :data="results" v-on:focus="onfocus" v-on:blur="onblur" v-on:input="oninput"
	    v-on:select="onselect">
		<template v-if="false" slot="header">
			<p class="mb-2 font-medium">Recently viewed symbols:</p>
		</template>
		<template slot-scope="props">
			<div class="columns is-mobile is-gapless">
				<div class="column is-narrow self-center mr-4">
					<symbol-logo class="is-32x32 shadow" :symbol="props.option.symbol"></symbol-logo>
				</div>
				<div class="column">
					<p class="title is-size-5 mr-1">{{ props.option.symbol }}</p>
					<p class="subtitle is-size-6">{{ props.option.name }}</p>
				</div>
			</div>
		</template>
	</b-autocomplete>
</template>
