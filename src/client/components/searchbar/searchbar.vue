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
		<b-autocomplete class="" type="search" placeholder="Search..." icon="magnify" open-on-focus v-model="query"
		    :data="results" :loading="busy" v-on:input="oninput" v-on:select="onselect">
			<template slot-scope="props">
				<router-link tag="div" :to="{ name: 'product', query: { id: props.option.appId, platform: props.option.platform } }"
				    class="columns is-mobile is-gapless">
					<div class="column fx-0">
						<img class="image is-32x32 mt-1 mr-3" :src="props.option.icon">
					</div>
					<div class="column content">
						<b-icon class="mr-1" :icon="props.option.platform" size="is-small" />
						<b>{{ v_truncate(props.option.title) }}</b> ({{ props.option.appId }})
						<span v-show="v_development">Score={{ props.option.fuzzy }}</span>
						<hr class="my-0">
						<span class="t-wrap">{{ v_desc(props.option) }}</span>
					</div>
				</router-link>
			</template>
		</b-autocomplete>
	</b-field>
</template>
