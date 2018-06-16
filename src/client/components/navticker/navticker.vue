<!--  -->
<script lang="ts" src="./navticker.ts"></script>

<style>
/**/

/*#navticker .navbar-item {
	color: var(--text-light);
}

#navticker a.navbar-item:hover {
	color: var(--link);
}*/

</style>

<template>
	<div id="navticker" class="columns is-gapless ml-8 overflow-x-auto">
		<div class="column is-narrow self-center">
			<button class="button is-small is-white has-text-lighter" @click="onstep(-1)">
				<b-icon icon="chevron-left"></b-icon>
			</button>
		</div>
		<!-- <div class="column is-narrow w-1 shadow-inner"></div> -->
		<div class="column flex-row items-center overflow-x-auto scrollbar-none">
			<router-link class="navbar-item flex-col" v-for="symbol in symbols" :key="symbol" :to="{name:$symbolname,params:{symbol:symbol}}"
			    exact-active-class>
				<div class="whitespace-no-wrap has-text-centered">
					<p class="is-size-7">
						<span class="font-medium">{{vname(wbtickers[symbol].name)}} </span>
						<!-- <span class="font-medium">{{symbol}} </span> -->
						<v-price-ticker class="has-text-light" :price="wbquotes[symbol].price"></v-price-ticker>
					</p>
					<p class="is-size-7">
						<span class="font-light" v-bull-bear="wbquotes[symbol].change">
							{{vnumber(wbquotes[symbol].change,{plusminus:true})}} ({{vnumber(wbquotes[symbol].changeRatio*100,{plusminus:true,percent:true})}})
						</span>
					</p>
				</div>
			</router-link>
		</div>
		<div class="column is-narrow self-center">
			<button class="button is-small is-white has-text-lighter" @click="onstep(1)">
				<b-icon icon="chevron-right"></b-icon>
			</button>
		</div>
	</div>
</template>
