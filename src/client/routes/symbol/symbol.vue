<!--  -->
<script lang="ts" src="./symbol.ts"></script>

<style lang="scss">
@import '@/client/styles/theme.scss';
//
.symbol-route .hero-body .progress::-webkit-progress-bar {
	background-color: $white;
	border: 1px solid $border;
}

</style>

<style>
/**/

</style>

<template>
	<section class="symbol-route">
		<section class="hero is-small has-background-white-bis">
			<div v-invisible="busy" class="hero-body">
				<div class="container">
					<div class="columns tablet-only:flex-wrap">

						<div class="column">
							<div class="columns is-mobile">
								<ui-symbol-logo class="column is-narrow my-1 is-96x96" :symbol="symbol"></ui-symbol-logo>
								<div class="column">
									<h1 class="title my-0 is-size-3 whitespace-no-wrap">
										{{symbol}}
										<span v-hidden="!(suspended||delisted)" class="tag is-danger h-initial align-middle">{{vcapitalize(wbquote.status)}}</span>
									</h1>
									<h2 class="subtitle my-0 is-size-5">{{instrument.simple_name||instrument.name}}</h2>
									<p class="subtitle is-size-7">{{ticker.disExchangeCode}}</p>
									<!-- <p class="subtitle is-size-6">{{yhquote.fullExchangeName}}</p> -->
									<!-- <p class="subtitle is-size-7">{{vfromnow(wbquote.mktradeTime,{max:1,verbose:true})}}</p> -->
								</div>
							</div>
						</div>

						<div class="column is-6-tablet is-narrow-desktop desktop:w-initial">
							<div class="columns is-mobile">
								<div class="column tablet-only:block hidden"></div>
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
								<div v-hidden="$store.state.hours.state=='REGULAR'" class="column is-narrow">
									<p class="subtitle is-size-7">{{exthours}}</p>
									<p class="title is-size-4 font-medium">{{vnumber(wbquote.pPrice)}}</p>
									<p class="subtitle is-size-6 whitespace-no-wrap font-medium" v-ui-green-red="wbquote.pChange">
										{{vnumber(wbquote.pChange,{plusminus:true})}} ({{vnumber(wbquote.pChRatio*100,{plusminus:true,percent:true})}})
									</p>
									<p class="subtitle is-size-7">{{vfromnow(wbquote.faTradeTime,{max:1,verbose:true})}}</p>
								</div>
								<div class="column is-narrow">
									<!-- <p class="subtitle is-size-7">Avg Volume</p> -->
									<!-- <p class="subtitle is-size-7 font-medium">{{vnumber(wbquote.avgVolume,{compact:true})}}</p> -->
									<p class="subtitle is-size-7">10day Volume</p>
									<p class="subtitle is-size-5 font-medium">{{vnumber(wbquote.avgVol10D,{compact:true})}}</p>
									<p class="subtitle is-size-7">3mo Volume</p>
									<p class="subtitle is-size-5 font-medium">{{vnumber(wbquote.avgVol3M,{compact:true})}}</p>
								</div>
							</div>
						</div>

						<div class="tablet-only:block hidden column is-4-tablet"></div>

						<div class="column is-4-tablet is-2-desktop">
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
								<p class="column is-narrow is-size-7 has-text-danger">{{vnumber(wbquote.bid)}}</p>
								<p class="column is-size-7 has-text-centered">({{vnumber(vpercent(wbquote.ask, wbquote.bid),{percent:true})}})</p>
								<p class="column is-narrow is-size-7 has-text-success">{{vnumber(wbquote.ask)}}</p>
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
								<p class="column is-size-7 has-text-success">{{vnumber(wbquote.bidSize,{precision:0})}}</p>
								<p class="column is-size-7 has-text-centered"></p>
								<p class="column is-size-7 has-text-danger has-text-right">{{vnumber(wbquote.askSize,{precision:0})}}</p>
							</div>
						</div>

						<div class="column is-4-tablet is-3-desktop is-2-widescreen">
							<table class="table is-narrowest is-fullwidth content is-small bg-transparent">
								<tbody>
									<tr v-for="deal in vdeals">
										<td>{{vfromnow(deal.tradeTime,{max:1})}}</td>
										<td class="has-text-right font-medium" :class="dealcolor(deal)">{{vnumber(deal.deal)}}</td>
										<td class="has-text-right">x {{vnumber(deal.volume,{precision:0})}}</td>
									</tr>
								</tbody>
							</table>
						</div>

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
			<component :is="tabs[tabindex].vcomponent" class=""></component>
		</transition>

	</section>
</template>
