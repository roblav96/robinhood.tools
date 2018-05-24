<!--  -->
<script lang="ts" src="./symbol.ts"></script>

<style>
/**/

section.symbol-route div.hero-body .progress::-webkit-progress-bar {
	background-color: white;
	border: 1px solid var(--border);
}

</style>

<template>
	<section class="symbol-route">
		<section class="hero is-small">
			<!-- <div v-visible="!busy" class="hero-body message" v-bull-bear:is="wbquote.change"> -->
			<div v-visible="!busy" class="hero-body">
				<div class="container">
					<div class="columns">



						<div class="column flex justify-start">
							<div class="mr-6">
								<symbol-logo class="is-80x80 shadow-md" :symbol="symbol"></symbol-logo>
							</div>
							<div class="has-text-left self-start bg-white border-grey-lightest border-solid border-1 rounded-r-lg px-4 py-2">
								<p class="title leading-tight">
									<span>{{symbol}}</span>
									<span v-show="!instrument.alive" class="tag is-medium is-danger align-top">Untradable</span>
									<span v-show="delisted||suspended" class="tag is-medium is-danger align-top">{{vcapitalize(quote.status)}}</span>
								</p>
								<p class="is-size-5">{{name}}</p>
							</div>
						</div>



						<div class="column flex justify-center">
							<!-- <div class="has-text-centered self-start bg-white border-solid border-1 rounded-lg px-4 py-2" v-bull-bear:border="wbquote.change"> -->
							<div class="has-text-centered self-start bg-white border-grey-lightest border-solid border-1 rounded-lg px-4 py-2">
								<p class="title">{{vnumber(quote.price)}}</p>
								<p class="is-size-5 font-medium" v-bull-bear="quote.change">
									<span>{{vnumber(quote.change,{plusminus:true})}}</span>
									<span>({{vnumber(quote.percent*100,{plusminus:true,percent:true,precision:2})}})</span>
								</p>
							</div>
						</div>



						<div class="column flex justify-end">
							<div class="has-text-right self-start bg-white border-grey-lightest border-solid border-1 rounded-l-lg px-4 py-2 mr-6">
								<p class="is-size-4 font-medium">{{vnumber(quote.volume,{compact:true,precision:2})}}</p>
								<p class="is-size-6">Volume</p>
							</div>
							<div class="has-text-right self-start bg-white border-grey-lightest border-solid border-1 rounded-l-lg px-4 py-2">
								<p class="is-size-4 font-medium">{{vnumber(marketcap,{compact:true,precision:2})}}</p>
								<p class="is-size-6">Market Cap</p>
							</div>
						</div>



						<!-- <div class="column">
							<div class="tags has-addons">
								<span class="tag title is-size-4 h-initial py-1 leading-tight is-white border-success border">
									{{vnumber(wbquote.price)}}
								</span>
								<span class="tag is-large font-medium bg-transparent border-color border" v-bull-bear="wbquote.change">
									{{vnumber(wbquote.change,{plusminus:true})}} ({{vnumber(wbquote.changeRatio*100,{plusminus:true,percent:true,precision:2})}})
								</span>
							</div>
						</div> -->



						<!-- <p class="tag m-0 mb-4 title is-size-4 h-initial px-4 is-white border-color border rounded-l-none">
									{{symbol}}
								</p>
								<p class="tag m-0 subtitle is-size-6 h-initial is-white border-color border rounded-l-none">
									{{name}}
								</p>
						<div class="column">
							<div class="tags">
								<span class="tag m-0 mb-2 title is-size-4 h-initial px-4 is-white border-color border rounded-l-none">
									{{symbol}}
								</span>
								<span class="tag m-0 subtitle is-size-6 h-initial is-white border-color border rounded-l-none">
									{{name}}
								</span>
							</div>
						</div> -->

						<!-- <div class="column"></div> -->

					</div>
				</div>



				<nav class="tabs is-toggle is-centered is-fullwidth mt-6">
					<div class="container">
						<ul class="has-background-white rounded">
							<li :class="{ 'is-active': tabindex == i }" v-on:click="tabindex = i" v-for="(tab, i) in tabs">
								<a class="no-underline">
									<b-icon :icon="tab.icon"></b-icon>
									<span>{{tab.title}}</span>
								</a>
							</li>
						</ul>
					</div>
				</nav>



			</div>
		</section>

		<hr class="h-px my-0">

		<section class="section has-background-white">
			<transition mode="out-in" enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
				<component :is="tabs[tabindex].vcomponent" class=""></component>
			</transition>
		</section>

	</section>
</template>



<!-- <div class="mr-4">
								<p class="title leading-tight">{{vnumber(wbquote.price)}}</p>
								<p class="is-size-6">{{vfromnow(wbquote.mktradeTime,{max:1,verbose:true})}}</p>
							</div>
							<div class="mr-4">
								<p class="is-size-4 leading-tight" v-bull-bear="wbquote.change">
									<span>{{vnumber(wbquote.change,{plusminus:true})}}</span>
									<span>({{vnumber(wbquote.changeRatio*100,{plusminus:true,percent:true,precision:2})}})</span>
								</p>
								<p class="is-size-6">Intra-Day</p>
							</div> -->



<!-- <div class="column is-narrow">
							<div class="columns is-mobile">
								<div class="column is-narrow">
									<p class="title">{{vnumber(wbquote.price)}}</p>
									<p class="is-size-5 font-medium" v-bull-bear="wbquote.change">
										
									</p>
									<p class="is-size-7">{{vfromnow(wbquote.mktradeTime,{max:1,verbose:true})}}</p>
								</div>
								<div class="column is-narrow">
									<p class="is-size-7">{{exthours}}</p>
									<p class="is-size-5 font-medium">{{vnumber(wbquote.pPrice)}}</p>
									<p class="is-size-7 font-medium" v-bull-bear="wbquote.pChange">
										{{vnumber(wbquote.pChange,{plusminus:true})}} ({{vnumber(wbquote.pChRatio*100,{plusminus:true,percent:true,precision:2})}})
									</p>
									<p class="is-size-7">{{vfromnow(wbquote.faTradeTime,{max:1,verbose:true})}}</p>
								</div>
								<div class="column is-narrow">
									<p class="is-size-7">Volume</p>
									<p class="is-size-5 leading-none font-medium mb-2">{{vnumber(wbquote.volume,{compact:true,precision:1})}}</p>
									<p class="is-size-7">Market Cap</p>
									<p class="is-size-5 leading-none font-medium">{{vnumber(marketcap,{compact:true,precision:0})}}</p>
								</div>
							</div>
						</div> -->



<!-- <div class="column is-3 is-2-fullhd content text-sm">
							<div class="columns is-mobile is-gapless mb-1">
								<p class="column is-narrow">Bid</p>
								<p class="column has-text-centered">Spread</p>
								<p class="column is-narrow">Ask</p>
							</div>
							<div class="columns is-mobile is-gapless mb-0">
								<div class="column is-6">
									<progress class="progress is-danger is-small rounded-none mb-0" :value="baprice.bid" :min="0" :max="100"
									    style="transform: rotate(180deg);"></progress>
								</div>
								<div class="column is-6">
									<progress class="progress is-success is-small rounded-none mb-0" :value="baprice.ask" :min="0" :max="100"></progress>
								</div>
							</div>
							<div class="columns is-mobile is-gapless mb-1">
								<p class="column is-narrow has-text-danger">{{vnumber(wbquote.bid)}}</p>
								<p class="column has-text-centered">{{vnumber(vpercent(wbquote.ask, wbquote.bid),{percent:true})}}</p>
								<p class="column is-narrow has-text-success">{{vnumber(wbquote.ask)}}</p>
							</div>
							<div class="columns is-mobile is-gapless mb-0">
								<div class="column is-6">
									<progress class="progress is-success is-small rounded-none mb-0" :value="basize.bid" :min="0" :max="100"
									    style="transform: rotate(180deg);"></progress>
								</div>
								<div class="column is-6">
									<progress class="progress is-danger is-small rounded-none mb-0" :value="basize.ask" :min="0" :max="100"></progress>
								</div>
							</div>
							<div class="columns is-mobile is-gapless mb-0">
								<p class="column has-text-success">{{vnumber(wbquote.bidSize,{precision:0})}}</p>
								<p class="column has-text-centered"></p>
								<p class="column has-text-danger has-text-right">{{vnumber(wbquote.askSize,{precision:0})}}</p>
							</div>
						</div> -->



<!-- <div class="column">
							<p class="is-size-7 leading-tight">10day Volume</p>
							<p class="is-size-5 font-medium">{{vnumber(wbquote.avgVol10D,{compact:true})}}</p>
							<p class="is-size-7 leading-tight">3mo Volume</p>
							<p class="is-size-5 font-medium">{{vnumber(wbquote.avgVol3M,{compact:true})}}</p>
						</div> -->



<!-- <div class="column is-narrow">
							<table class="table is-narrower is-fullwidth bg-transparent align-bottom">
								<tbody>
									<tr>
										<td class="title is-size-3">{{vnumber(wbquote.price)}}</td>
										<td class="is-size-5 font-medium" v-bull-bear="wbquote.change">
											{{vnumber(wbquote.change,{plusminus:true})}} ({{vnumber(wbquote.changeRatio*100,{plusminus:true,percent:true})}})
										</td>
									</tr>
									<tr>
										<td class="is-size-5 font-medium">{{vnumber(wbquote.pPrice)}}</td>
										<td class="">
											<p class="is-size-6 font-medium" v-bull-bear="wbquote.pChange">
												{{vnumber(wbquote.pChange,{plusminus:true})}} ({{vnumber(wbquote.pChRatio*100,{plusminus:true,percent:true})}})
											</p>
										</td>
									</tr>
									<tr>
										<td>{{exthours}}</td>
									</tr>
								</tbody>
							</table>
						</div> -->

<!-- <div class="column">
							<div class="columns is-mobile">
								<div class="column is-narrow">
									<p class="title is-size-3">
										<span class="">{{vnumber(wbquote.price)}}</span>
										<span class="subtitle font-medium">
											<span class="font-normal"> x</span>
											{{vnumber(wbquote.volume,{compact:true})}}
										</span>
									</p>
									<p class="subtitle is-size-5 whitespace-no-wrap font-medium" v-bull-bear="wbquote.change">
										{{vnumber(wbquote.change,{plusminus:true})}} ({{vnumber(wbquote.changeRatio*100,{plusminus:true,percent:true})}})
									</p>
									<p class="subtitle is-size-7">{{vfromnow(wbquote.mktradeTime,{max:1,verbose:true})}}</p>
								</div>
								<div v-show="$store.state.hours.state!='REGULAR'" class="column is-narrow">
									<p class="subtitle is-size-7">{{exthours}}</p>
									<p class="title is-size-4 font-medium">{{vnumber(wbquote.pPrice)}}</p>
									<p class="subtitle is-size-6 whitespace-no-wrap font-medium" v-bull-bear="wbquote.pChange">
										{{vnumber(wbquote.pChange,{plusminus:true})}} ({{vnumber(wbquote.pChRatio*100,{plusminus:true,percent:true})}})
									</p>
									<p class="subtitle is-size-7">{{vfromnow(wbquote.faTradeTime,{max:1,verbose:true})}}</p>
								</div>
								<div class="column is-narrow">
									<p class="subtitle is-size-7">10day Volume</p>
									<p class="subtitle is-size-5 font-medium">{{vnumber(wbquote.avgVol10D,{compact:true})}}</p>
									<p class="subtitle is-size-7">3mo Volume</p>
									<p class="subtitle is-size-5 font-medium">{{vnumber(wbquote.avgVol3M,{compact:true})}}</p>
								</div>
							</div>
						</div> -->

<!-- <div class="tablet-only:block hidden column is-4-tablet"></div> -->

<!-- <div class="column is-4-tablet is-3-desktop is-2-fullhd">
							<table class="table is-narrowest is-fullwidth content is-small bg-transparent">
								<tbody>
									<tr v-for="deal in vdeals">
										<td>{{vfromnow(deal.tradeTime,{max:1})}}</td>
										<td class="has-text-right font-medium" :class="dealcolor(deal)">{{vnumber(deal.deal)}}</td>
										<td class="has-text-right">x {{vnumber(deal.volume,{precision:0})}}</td>
									</tr>
								</tbody>
							</table>
						</div> -->

<!-- <article class="message column is-dark">
							<div class="message-body">
								haiii
							</div>
						</article> -->
