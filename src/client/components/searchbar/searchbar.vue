<!--  -->
<script lang="ts" src="./searchbar.ts"></script>

<style lang="scss">
// 
@import '~bulma/sass/utilities/mixins';
@include mobile {
	div.searchbar .autocomplete .dropdown-content {
		position: fixed;
		left: 5vw;
		right: 5vw;
	}
}

</style>

<style>
/**/

div.searchbar .autocomplete .dropdown-content {
	max-height: 66vh;
}

/**/

</style>

<template>
	<b-field class="searchbar">
		<b-autocomplete class="is-danger" custom-class="is-danger" type="search" placeholder="Search..." icon="magnify" open-on-focus v-model="query"
		    :data="results" :loading="busy" v-on:input="oninput" v-on:select="onselect">
			<template slot-scope="props">
				<router-link tag="div" :to="{ name: 'symbol' }" class="columns is-mobile is-gapless">
					<div>{{ props.option }}</div>
				</router-link>
			</template>
		</b-autocomplete>
	</b-field>
</template>
