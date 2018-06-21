<!--  -->
<script lang="ts" src="./symbol.chart.ts"></script>

<style>
/**/

</style>

<template>
	<div class="flex-col-full">
		<section class="section py-0">
			<div class="columns is-mobile my-0 items-center">

				<div class="column is-narrow">
					<b-dropdown hoverable>
						<button class="button" slot="trigger">
							<b-icon icon="tune"></b-icon>
						</button>
						<b-dropdown-item custom>
							<b-field label="X Axis Scale">
								<b-field>
									<b-radio-button class="is-expanded" v-model="settings.axis" native-value="category" :disabled="busy">
										<b-icon icon="reorder-vertical"></b-icon>
										<span>Linear</span>
									</b-radio-button>
									<b-radio-button class="is-expanded" v-model="settings.axis" native-value="time" :disabled="busy">
										<b-icon icon="av-timer"></b-icon>
										<span>Time</span>
									</b-radio-button>
								</b-field>
							</b-field>
							<b-field label="Price Chart Type">
								<b-field>
									<b-radio-button class="is-expanded" v-model="settings.ohlc" :native-value="true" :disabled="busy">
										<b-icon icon="poll"></b-icon>
										<span>OHLC</span>
									</b-radio-button>
									<b-radio-button class="is-expanded" v-model="settings.ohlc" :native-value="false" :disabled="busy">
										<b-icon icon="chart-line-variant"></b-icon>
										<span>Line</span>
									</b-radio-button>
								</b-field>
							</b-field>
						</b-dropdown-item>
					</b-dropdown>
				</div>

				<div class="column is-narrow">
					<b-field>
						<b-radio-button :class="{'is-loading':busy&&settings.range==v}" v-model="settings.range" type="is-primary"
						    :disabled="busy" v-for="v in ranges" :native-value="v" :key="v">
							<span>{{vcapitalize(v)}}</span>
						</b-radio-button>
					</b-field>
				</div>
				<div class="column is-narrow">
					<b-tooltip :active="brushing" label="Click and drag chart area to crop" animated>
						<button class="button" :class="{'is-primary':brushing}" @click="brushing=!brushing">
							<b-icon icon="crop"></b-icon>
						</button>
					</b-tooltip>
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
