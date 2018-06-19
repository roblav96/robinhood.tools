<!--  -->
<script lang="ts" src="./symbol.ts"></script>

<style>
/**/

</style>

<template>
	<div id="symbol_route" class="flex-col-full">

		<section class="section py-0 has-background-white">
			<div class="columns my-0 items-center">

				<div class="column is-narrow">
					<div class="columns is-mobile items-center">
						<div class="column is-narrow">
							<v-symbol-logo class="is-56x56 shadow" :symbol="symbol"></v-symbol-logo>
						</div>
						<div class="column">
							<p class="title">{{symbol}}</p>
							<p>{{vname(all.quote.tinyName||all.quote.name)}}</p>
						</div>
					</div>
				</div>

				<div class="column is-narrow">
					<div class="columns is-mobile whitespace-no-wrap text-center">
						<div class="column">
							<p>
								<v-price-ticker class="title has-text" :price="all.quote.price"></v-price-ticker>
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

				<div class="column overflow-x-auto scrollbar is-hidden-mobile">
					<div class="columns items-center is-mobile whitespace-no-wrap text-center">
						<div v-if="all.quote.volume" class="column is-narrow">
							<p class="is-size-4">
								{{vnumber(all.quote.volume,{compact:true,precision:1})}}
							</p>
							<p>Volume</p>
						</div>
						<div v-if="all.quote.avgVolume" class="column is-narrow">
							<p class="is-size-4">
								{{vnumber(all.quote.avgVolume,{compact:true,precision:1})}}
							</p>
							<p>Avg Volume</p>
						</div>
						<div v-if="all.quote.marketCap" class="column is-narrow">
							<p class="is-size-4">
								{{vnumber(all.quote.marketCap,{compact:true})}}
							</p>
							<p>Market Cap</p>
						</div>
					</div>
				</div>



			</div>
		</section>
		<hr>

		<v-symbol-chart :quote="all.quote"></v-symbol-chart>

		<!-- <router-view :symbol="symbol" :quote="all.quote"></router-view> -->

	</div>
</template>
