<!--  -->
<script lang="ts" src="./symbol.ts"></script>

<style>
/**/

</style>

<template>
	<div id="symbol_route" class="flex-col-full is-max-fullheight">

		<section class="section py-0 has-background-white shadow-sm">
			<div class="columns my-0 items-center">

				<div class="column is-narrow">
					<div class="columns is-mobile items-center">
						<div class="column is-narrow">
							<v-symbol-logo class="is-56x56 shadow" :symbol="symbol" :acronym="all.quote.acronym"></v-symbol-logo>
						</div>
						<div class="column">
							<div class="flex">
								<p class="title mr-1">{{symbol}}</p>
								<!-- <p class="flex-1 self-end has-text-lightest">
									<span v-if="all.quote.acronym">{{all.quote.acronym}} </span>
									<span v-if="all.quote.type">- {{all.quote.type}} </span>
								</p> -->
							</div>
							<p>{{vtruncate(vname(all.quote.name),32)}}</p>
						</div>
					</div>
				</div>

				<div class="column is-narrow">
					<div class="columns is-mobile items-center whitespace-no-wrap text-center">
						<div class="column">
							<p>
								<v-price-ticker class="title" :price="all.quote.price"></v-price-ticker>
							</p>
							<p>
								<v-timestamp :value="all.quote.timestamp" :opts="{verbose:true}"></v-timestamp>
							</p>
						</div>
						<div class="column">
							<p class="title" v-bull-bear="all.quote.percent">
								{{vnumber(all.quote.percent,{plusminus:true,percent:true})}}
							</p>
							<p v-bull-bear="all.quote.change">
								{{vnumber(all.quote.change,{plusminus:true})}}
							</p>
						</div>
					</div>
				</div>

				<div class="column is-narrow p-0 mr-1">
					<button class="button is-small is-white has-text-lightest" @click="onstep(-1)">
						<b-icon icon="menu-left"></b-icon>
					</button>
				</div>
				<div class="column overflow-x-auto scrollbar">
					<div class="columns items-center is-mobile whitespace-no-wrap text-center">
						<div v-if="Number.isFinite(all.quote.volume)" class="column is-narrow">
							<p class="is-size-4">
								{{vnumber(all.quote.volume,{compact:true,precision:1})}}
							</p>
							<p>Volume</p>
						</div>
						<div v-if="Number.isFinite(all.quote.avgVolume)" class="column is-narrow">
							<p class="is-size-4">
								{{vnumber(all.quote.avgVolume,{compact:true,precision:1})}}
							</p>
							<p>Avg Volume</p>
						</div>
						<div v-if="Number.isFinite(all.quote.avgVolume10Day)" class="column is-narrow">
							<p class="is-size-4">
								{{vnumber(all.quote.avgVolume10Day,{compact:true,precision:1})}}
							</p>
							<p>10d Volume</p>
						</div>
						<div v-if="Number.isFinite(all.quote.avgVolume3Month)" class="column is-narrow">
							<p class="is-size-4">
								{{vnumber(all.quote.avgVolume3Month,{compact:true,precision:1})}}
							</p>
							<p>3mo Volume</p>
						</div>
						<div v-if="Number.isFinite(all.quote.marketCap)" class="column is-narrow">
							<p class="is-size-4">
								{{vnumber(all.quote.marketCap,{compact:true,precision:1})}}
							</p>
							<p>Market Cap</p>
						</div>
						<div v-if="Number.isFinite(all.quote.sharesFloat)" class="column is-narrow">
							<p class="is-size-4">
								{{vnumber(all.quote.sharesFloat,{compact:true,precision:1})}}
							</p>
							<p>Shares Float</p>
						</div>
						<div v-if="Number.isFinite(all.quote.sharesOutstanding)" class="column is-narrow">
							<p class="is-size-4">
								{{vnumber(all.quote.sharesOutstanding,{compact:true,precision:1})}}
							</p>
							<p>Shares Outstanding</p>
						</div>
					</div>
				</div>
				<div class="column is-narrow p-0 ml-1">
					<button class="button is-small is-white has-text-lightest" @click="onstep(1)">
						<b-icon icon="menu-right"></b-icon>
					</button>
				</div>



			</div>
		</section>

		<v-symbol-chart :quote="all.quote"></v-symbol-chart>

		<router-view :symbol="symbol" :quote="all.quote"></router-view>

	</div>
</template>
