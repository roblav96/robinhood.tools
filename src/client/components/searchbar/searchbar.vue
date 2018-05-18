<!--  -->
<script lang="ts" src="./searchbar.ts"></script>

<style>
/**/

div.searchbar div.dropdown-content {
	max-width: 75vw;
	max-height: 75vh;
}

</style>

<template>
	<b-field class="searchbar navbar-item">
		<b-autocomplete ref="searchbar_input" open-on-focus keep-first type="search" placeholder="Search anything..."
		    icon="magnify" v-model="query" :data="results" v-on:focus="onfocus" v-on:blur="onblur" v-on:input="oninput"
		    v-on:select="onselect">
			<template slot-scope="props">
				<div class="columns is-mobile is-gapless">
					<div class="column is-narrow">
						<symbol-logo class="is-32x32 shadow mr-4 self-center" :symbol="props.option.symbol"></symbol-logo>
					</div>
					<div class="column content">
						<p class="title is-5">{{ props.option.symbol }}</p>
						<p class="subtitle is-6">{{ props.option.simple_name || props.option.name }}</p>
					</div>
				</div>
			</template>
		</b-autocomplete>
	</b-field>
</template>
