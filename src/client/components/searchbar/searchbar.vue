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
	padding: 0px 1rem;
	padding-bottom: 0.25rem;
}

#searchbar div.dropdown-item:empty {
	display: none;
}
</style>

<template>
	<b-field id="searchbar">
		<b-autocomplete
			ref="searchbar_autocomplete"
			open-on-focus
			clear-on-select
			:keep-first="!!query"
			type="search"
			placeholder="Search..."
			icon="magnify"
			v-model="query"
			:data="results"
			v-on:focus="onfocus"
			v-on:blur="onblur"
			v-on:input="oninput"
			v-on:select="onselect"
		>
			<template v-if="!query" slot="header">
				<span class="has-text-lightest is-size-6">Recently Viewed</span>
			</template>
			<template slot="empty">No results found...</template>
			<template slot-scope="props">
				<div class="columns is-mobile is-gapless items-center">
					<div class="column is-narrow mr-4">
						<v-symbol-logo
							class="is-40x40 shadow"
							:symbol="props.option.symbol"
							:acronym="props.option.acronym"
						></v-symbol-logo>
					</div>
					<div class="column">
						<div class="flex">
							<p class="title is-size-5 mr-1">{{ props.option.symbol }}</p>
							<p class="flex-1 leading-tight is-size-6 self-end has-text-lightest">
								<span v-if="props.option.acronym">{{ props.option.acronym }} </span>
								<!-- <span v-if="props.option.type">- {{props.option.type}} </span> -->
							</p>
						</div>
						<p class="subtitle is-size-6">{{ vname(props.option.name) }}</p>
					</div>
				</div>
			</template>
		</b-autocomplete>
	</b-field>
</template>
