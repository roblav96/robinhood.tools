<!--  -->
<script lang="ts" src="./navticker.ts"></script>

<style>
/**/

</style>

<template>
	<div id="navticker" class="flex-row items-center overflow-x-auto scrollbar ml-4">
		<div class="px-2 flex-col" v-for="symbol in symbols" :key="symbol">
			<div class="has-text-centered has-text-light is-size-7 whitespace-no-wrap leading-tighter">
				<p>{{vname(wbtickers[symbol].name)}}</p>
				<p>
					<v-price-ticker :price="wbquotes[symbol].price"></v-price-ticker>
				</p>
				<p class="font-light" v-bull-bear="wbquotes[symbol].change">
					{{vnumber(wbquotes[symbol].change,{plusminus:true})}} ({{vnumber(wbquotes[symbol].changeRatio*100,{plusminus:true,percent:true})}})
				</p>
			</div>
		</div>
	</div>
</template>
