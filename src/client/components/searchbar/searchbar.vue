<!--  -->
<script lang="ts" src="./searchbar.ts"></script>

<style>
/**/

div.searchbar div.dropdown-content {
	max-width: 50vw;
	max-height: 66vh;
}

</style>

<template>
	<b-field class="searchbar navbar-item">
		<b-autocomplete ref="searchbar_input" open-on-focus type="search" placeholder="Search anything..."
		    icon="magnify" v-model="query" :data="results" :loading="busy" v-on:focus="onfocus" v-on:blur="onblur"
		    v-on:input="oninput" v-on:select="onselect">
			<template slot-scope="props">
				<router-link :to="{name:'symbol'}" class="columns is-mobile is-gapless">
					<img class="column is-narrow is-png image is-32x32 mr-4 self-center rounded" :src="'https://storage.googleapis.com/iex/api/logos/'+props.option.symbol+'.png'"
					    v-on:error="onerror">
					<div class="column content">
						<p class="title is-5 is-spaced mb-0">{{ props.option.symbol }}</p>
						<p class="subtitle is-6">{{ props.option.name }}</p>
					</div>
				</router-link>
			</template>
		</b-autocomplete>
	</b-field>
</template>
