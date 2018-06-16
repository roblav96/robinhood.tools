<!--  -->
<script lang="ts" src="./navticker.ts"></script>

<style>
/**/

</style>

<template>
	<div id="navticker" class="columns is-gapless ml-2 overflow-x-auto">
		<div class="column is-narrow self-center">
			<button class="button is-small is-white has-text-lighter" @click="onstep(-1)">
				<b-icon icon="chevron-left"></b-icon>
			</button>
		</div>
		<div class="column flex-row items-center overflow-x-auto scrollbar-none">
			<div class="px-2 flex-col" v-for="symbol in symbols" :key="symbol">
				<div class="has-text-light is-size-7 whitespace-no-wrap">
					<p class="font-medium">{{vname(wbtickers[symbol].name)}}</p>
					<p>
						<v-price-ticker :price="wbquotes[symbol].price"></v-price-ticker>
						<span class="font-light" v-bull-bear="wbquotes[symbol].change">
							{{vnumber(wbquotes[symbol].change,{plusminus:true})}} ({{vnumber(wbquotes[symbol].changeRatio*100,{plusminus:true,percent:true})}})
						</span>
					</p>
					<!-- <p class="font-light" v-bull-bear="wbquotes[symbol].change">
						{{vnumber(wbquotes[symbol].change,{plusminus:true})}} ({{vnumber(wbquotes[symbol].changeRatio*100,{plusminus:true,percent:true})}})
					</p> -->
				</div>
			</div>
		</div>
		<div class="column is-narrow self-center">
			<button class="button is-small is-white has-text-lighter" @click="onstep(1)">
				<b-icon icon="chevron-right"></b-icon>
			</button>
		</div>
	</div>
</template>
