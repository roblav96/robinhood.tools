<!--  -->
<script lang="ts" src="./symbol.ts"></script>

<!-- <style lang="scss">
@import '@/client/styles/theme.scss';
//

</style> -->

<style>
/**/

.symbol-route .hero-body p {
	margin-top: 0px !important;
	margin-bottom: 0px !important;
	line-height: 1.25;
}

.symbol-route .hero-body p.title {
	line-height: 1;
}

.symbol-route .hero-body p.is-size-7 {
	line-height: 1.5;
}

.symbol-route .hero-body .progress::-webkit-progress-bar {
	background-color: white;
	border: 1px solid var(--border);
}

</style>

<template>
	<section class="symbol-route">
		<section class="hero is-small has-background-white-bis">
			<div v-visible="!busy" class="hero-body">
				<div class="container">
					<div v-is:widescreenAndUp.is-variable.is-4 class="columns">

						<div class="column">
							<div class="flex">
								<div class="mr-4 mt-1">
									<ui-symbol-logo class="is-64x64 shadow-md" :symbol="symbol"></ui-symbol-logo>
								</div>
								<div>
									<p class="title is-size-3">
										{{symbol}}
										<span v-show="delisted||suspended" class="tag is-danger font-medium">{{vcapitalize(wbquote.status)}}</span>
									</p>
									<p class="is-size-5">{{name}}</p>
									<p class="is-size-7">{{ticker.disExchangeCode}}</p>
								</div>
							</div>
						</div>

						<div class="column is-narrow">
							<div class="columns is-mobile">
								<div class="column is-narrow">
									<p class="title is-size-3">{{vnumber(wbquote.price)}}</p>
									<p class="is-size-5 font-medium" v-ui-green-red="wbquote.change">
										{{vnumber(wbquote.change,{plusminus:true})}} ({{vnumber(wbquote.changeRatio*100,{plusminus:true,percent:true})}})
									</p>
									<p class="is-size-7">{{vfromnow(wbquote.mktradeTime,{max:1,verbose:true})}}</p>
								</div>
								<div v-show="isexthours" class="column is-narrow">
									<p class="is-size-7">{{exthours}}</p>
									<p class="is-size-5 leading-tighter font-medium">{{vnumber(wbquote.pPrice)}}</p>
									<p class="is-size-7 font-medium" v-ui-green-red="wbquote.pChange">
										{{vnumber(wbquote.pChange,{plusminus:true})}} ({{vnumber(wbquote.pChRatio*100,{plusminus:true,percent:true})}})
									</p>
									<p class="is-size-7">{{vfromnow(wbquote.faTradeTime,{max:1,verbose:true})}}</p>
								</div>
								<div class="column is-narrow">
									<p class="is-size-7">Volume</p>
									<p class="is-size-5 leading-none font-medium">{{vnumber(wbquote.volume,{compact:true})}}</p>
									<p class="is-size-7">Market Cap</p>
									<p class="is-size-5 leading-none font-medium">{{vnumber(marketcap,{compact:true})}}</p>
								</div>
							</div>
						</div>



						<div class="column is-3 is-2-widescreen">
							<div class="columns is-mobile is-gapless mb-0">
								<p class="column is-narrow is-size-7">Bid</p>
								<p class="column is-size-7 has-text-centered">Spread</p>
								<p class="column is-narrow is-size-7">Ask</p>
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
							<div class="columns is-mobile is-gapless mb-0">
								<p class="column is-narrow is-size-7 has-text-danger font-medium">{{vnumber(wbquote.bid)}}</p>
								<p class="column is-size-7 has-text-centered font-medium">{{vnumber(vpercent(wbquote.ask, wbquote.bid),{percent:true})}}</p>
								<p class="column is-narrow is-size-7 has-text-success font-medium">{{vnumber(wbquote.ask)}}</p>
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
								<p class="column is-size-7 has-text-success font-medium">{{vnumber(wbquote.bidSize,{precision:0})}}</p>
								<p class="column is-size-7 has-text-centered font-medium"></p>
								<p class="column is-size-7 has-text-danger has-text-right font-medium">{{vnumber(wbquote.askSize,{precision:0})}}</p>
							</div>
						</div>



						<!-- <div class="column">
							<p class="is-size-7 leading-tight">10day Volume</p>
							<p class="is-size-5 font-medium">{{vnumber(wbquote.avgVol10D,{compact:true})}}</p>
							<p class="is-size-7 leading-tight">3mo Volume</p>
							<p class="is-size-5 font-medium">{{vnumber(wbquote.avgVol3M,{compact:true})}}</p>
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
									<p class="subtitle is-size-5 whitespace-no-wrap font-medium" v-ui-green-red="wbquote.change">
										{{vnumber(wbquote.change,{plusminus:true})}} ({{vnumber(wbquote.changeRatio*100,{plusminus:true,percent:true})}})
									</p>
									<p class="subtitle is-size-7">{{vfromnow(wbquote.mktradeTime,{max:1,verbose:true})}}</p>
								</div>
								<div v-show="$store.state.hours.state!='REGULAR'" class="column is-narrow">
									<p class="subtitle is-size-7">{{exthours}}</p>
									<p class="title is-size-4 font-medium">{{vnumber(wbquote.pPrice)}}</p>
									<p class="subtitle is-size-6 whitespace-no-wrap font-medium" v-ui-green-red="wbquote.pChange">
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

					</div>
				</div>
			</div>
			<div class="hero-foot">
				<nav class="tabs is-boxed">
					<div class="container">
						<ul>
							<li :class="{ 'is-active': tabindex == i }" v-on:click="tabindex = i" v-for="(tab, i) in tabs">
								<a>
									<b-icon :icon="tab.icon"></b-icon>
									<span>{{tab.title}}</span>
								</a>
							</li>
						</ul>
					</div>
				</nav>
			</div>
		</section>

		<transition mode="out-in" enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
			<component :is="tabs[tabindex].vcomponent" class="has-background-white"></component>
		</transition>

	</section>
</template>
