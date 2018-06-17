<!--  -->
<script lang="ts" src="./symbol.ts"></script>

<style>
/**/

</style>

<template>
	<div id="symbol_route" class="flex-col has-background-white-ter">

		<section class="section py-0 has-background-white">
			<div class="columns my-0 items-center">

				<div class="column is-narrow">
					<div class="columns is-mobile items-center">
						<div class="column is-narrow">
							<v-symbol-logo class="is-56x56 shadow" :symbol="symbol"></v-symbol-logo>
						</div>
						<div class="column">
							<span class="title">{{symbol}}</span>
							<br> {{vname(all.quote.tinyName||all.quote.name)}} / {{all.quote.acronym}}
						</div>
					</div>
				</div>

				<div class="column is-narrow">
					<div class="columns is-mobile whitespace-no-wrap text-center">
						<div class="column">
							<v-price-ticker class="title has-text" :price="all.quote.price"></v-price-ticker>
							<br>
							<v-timestamp :value="all.quote.timestamp" :opts="{verbose:true}"></v-timestamp>
						</div>
						<div class="column">
							<span class="title" v-bull-bear="all.quote.percent">
								{{vnumber(all.quote.percent,{plusminus:true,percent:true})}}
							</span>
							<br>
							<span v-bull-bear="all.quote.change">
								{{vnumber(all.quote.change,{plusminus:true})}}
							</span>
						</div>
					</div>
				</div>

				<div class="column overflow-x-auto scrollbar is-hidden-mobile">
					<div class="columns items-center is-mobile whitespace-no-wrap text-center">
						<div v-if="all.quote.volume" class="column is-narrow">
							<span class="is-size-4 leading-tighter">
								{{vnumber(all.quote.volume,{compact:true,precision:1})}}
							</span>
							<br> Volume
						</div>
						<div v-if="all.quote.avgVolume" class="column is-narrow">
							<span class="is-size-4 leading-tighter">
								{{vnumber(all.quote.avgVolume,{compact:true,precision:1})}}
							</span>
							<br> Avg Volume
						</div>
						<div v-if="all.quote.marketCap" class="column is-narrow">
							<span class="is-size-4 leading-tighter">
								{{vnumber(all.quote.marketCap,{compact:true})}}
							</span>
							<br> Market Cap
						</div>
					</div>
				</div>



			</div>
		</section>

		<v-symbol-chart :symbol="symbol" :quote="all.quote"></v-symbol-chart>

		<router-view :symbol="symbol" :quote="all.quote"></router-view>

	</div>
</template>
