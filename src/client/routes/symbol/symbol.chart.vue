<!--  -->
<script lang="ts" src="./symbol.chart.ts"></script>

<style>
/**/

.select select {
	padding-right: 1.5rem !important;
}

</style>

<template>
	<div class="flex-col-full">
		<section class="section py-0">
			<div class="columns is-mobile my-0 items-center">

				<div class="column is-narrow">
					<b-dropdown :disabled="busy" hoverable>
						<b-field slot="trigger">
							<p class="control">
								<button class="button" @click="settings.time=!settings.time">
									<b-icon :icon="settings.time?'av-timer':'reorder-vertical'"></b-icon>
								</button>
							</p>
							<p class="control">
								<button class="button" @click="settings.ohlc=!settings.ohlc">
									<b-icon :icon="settings.ohlc?'poll':'chart-line-variant'"></b-icon>
								</button>
							</p>
						</b-field>
						<b-dropdown-item custom class="text-initial pb-2">
							<b-field label="X Axis Scale">
								<b-field>
									<b-radio v-model="settings.time" :native-value="false" :disabled="busy">Linear</b-radio>
									<b-radio v-model="settings.time" :native-value="true" :disabled="busy">Time</b-radio>
								</b-field>
							</b-field>
							<b-field label="Price Chart">
								<b-field>
									<b-radio v-model="settings.ohlc" :native-value="true" :disabled="busy">OHLC</b-radio>
									<b-radio v-model="settings.ohlc" :native-value="false" :disabled="busy">Line</b-radio>
								</b-field>
							</b-field>
						</b-dropdown-item>
					</b-dropdown>
				</div>

				<div class="column is-narrow">
					<b-field>
						<b-radio-button type="is-primary" :disabled="busy" v-model="settings.range" v-for="v in ranges" :key="v"
						    :native-value="v">
							<span>{{vcapitalize(v)}}</span>
						</b-radio-button>
					</b-field>
				</div>

				<div class="column">
				</div>

				<div class="column is-narrow">
					<b-field grouped>
						<p class="control">
							<button class="button" :disabled="busy" @click="()=>$refs.symbol_vechart.resetzoom()">
								<b-icon icon="crop-landscape"></b-icon>
							</button>
						</p>
						<p class="control">
							<b-tooltip :active="brushing" multilined label="Click and drag chart to crop zoom" size="is-small"
							    animated>
								<button class="button" :disabled="busy" :class="{'is-primary':brushing}" @click="brushing=!brushing">
									<b-icon icon="crop"></b-icon>
								</button>
							</b-tooltip>
						</p>
						<p class="control">
							<button class="button" :disabled="busy" @click="()=>$refs.symbol_vechart.latestzoom()">
								<b-icon icon="page-last"></b-icon>
							</button>
						</p>
					</b-field>
				</div>

			</div>
		</section>

		<!-- <section class="flex-col-full overflow-y-auto"> -->
		<v-symbol-echart class="flex-col-full" ref="symbol_vechart" :quote="quote" :settings="settings" :isbrushing.sync="brushing"></v-symbol-echart>
		<!-- </section> -->



		<!-- <v-loading :is-full-page="false" :active="true"></v-loading> -->
		<!-- <div class="column"> -->
		<!-- <div class="column">
					<b-dropdown v-model="range" hoverable position="is-top-right">
						<button class="button is-large is-primary" type="button" slot="trigger">
							<b-icon icon="calendar-range"></b-icon>
							<span>{{vstcase(range)}}</span>
						</button>
						<b-dropdown-item v-for="v in ranges" :value="v">
							<span>{{vstcase(v)}}</span>
						</b-dropdown-item>
					</b-dropdown>
				</div> -->
		<!-- </div> -->

	</div>
</template>
