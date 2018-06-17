<!--  -->
<script lang="ts" src="./symbol.ts"></script>

<style>
/**/

</style>

<template>
	<div id="symbol_route" class="flex-col has-background-white-ter">

		<section class="section has-background-white">
			<div class="columns items-center whitespace-no-wrap">

				<div class="column is-narrow">
					<div class="columns is-mobile items-center">
						<div class="column is-narrow">
							<v-symbol-logo class="is-56x56 shadow" :symbol="symbol"></v-symbol-logo>
						</div>
						<div class="column">
							<span class="title">{{symbol}}</span>
							{{all.quote.acronym}}
							<br> {{vname(all.quote.name)}}
						</div>
					</div>
				</div>

				<div class="column is-narrow">
					<div class="columns is-mobile has-text-centered">
						<div class="column">
							<v-price-ticker class="title" :price="all.quote.price"></v-price-ticker>
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



				<!-- <div class="column flex-row items-center">
					<v-symbol-logo class="is-24x24 shadow mr-0" :symbol="symbol"></v-symbol-logo>
					<p class="title leading-none is-size-4 mr-0">{{vname(all.quote.tinyName||all.quote.name)}}</p>
					<p class="self-end">{{all.quote.acronym}}</p>
				</div> -->
			</div>
		</section>
		
		<v-symbol-chart :symbol="symbol" :quote="all.quote"></v-symbol-chart>

	</div>
</template>
