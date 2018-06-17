<!--  -->
<script lang="ts" src="./symbol.chart.ts"></script>

<style>
/**/

</style>

<template>
	<div class="flex-col-full">

		<section class="section py-0">
			<div class="columns is-mobile items-center">
				<div class="column is-narrow">
					<div class="field has-addons">
						<p class="control">
							<b-tooltip :active="!busy&&!!ranges[rangeindex-1]" :label="vrange(ranges[rangeindex-1])" size="is-small"
							    animated>
								<button class="button" @click="range=ranges[rangeindex-1]" :disabled="busy||!ranges[rangeindex-1]">
									<b-icon type="is-primary" icon="chevron-left"></b-icon>
								</button>
							</b-tooltip>
						</p>
						<p class="control">
							<b-dropdown v-model="range" :disabled="busy">
								<b-tooltip label="Date Range" size="is-small" slot="trigger" animated>
									<button class="button" style="width:5rem;" :class="{'is-loading':busy}" type="button">
										<!-- <b-icon :icon="rangeindex==0?'clipboard-pulse-outline':'calendar-today'"></b-icon> -->
										<span>{{vrange(range)}}</span>
									</button>
								</b-tooltip>
								<b-dropdown-item class="is-size-6 font-bold py-0 my-0" custom>Date Range</b-dropdown-item>
								<b-dropdown-item separator></b-dropdown-item>
								<b-dropdown-item class="font-medium" @click="range=v" v-for="v in ranges" :value="v" :key="v">
									<span>{{vrange(v)}}</span>
								</b-dropdown-item>
							</b-dropdown>
						</p>
						<p class="control">
							<b-tooltip :active="!busy&&!!ranges[rangeindex+1]" :label="vrange(ranges[rangeindex+1])" size="is-small"
							    animated>
								<button class="button" @click="range=ranges[rangeindex+1]" :disabled="busy||!ranges[rangeindex+1]">
									<b-icon type="is-primary" icon="chevron-right"></b-icon>
								</button>
							</b-tooltip>
						</p>
					</div>
				</div>
				<!-- <div class="column">
					<b-field>
						<b-radio-button v-model="range" type="is-primary" v-for="v in ranges" :native-value="v" :key="v">
							<span>{{vrange(v)}}</span>
						</b-radio-button>
					</b-field>
				</div> -->
				<div class="column is-narrow">
					<!-- <b-field class="rounded">
						<b-tooltip label="Candlestick" size="is-small">
							<b-radio-button class="is-outlined" v-model="ohlc" :native-value="true">
								<b-icon icon="poll"></b-icon>
							</b-radio-button>
						</b-tooltip>
						<b-tooltip label="Line" size="is-small">
							<b-radio-button class="is-outlined" v-model="ohlc" :native-value="false">
								<b-icon icon="chart-line-variant"></b-icon>
							</b-radio-button>
						</b-tooltip>
					</b-field> -->
					<b-tooltip label="Chart Style" size="is-small" animated>
						<b-field class="w-32">
							<b-select v-model="ohlc" :icon="ohlc?'poll':'chart-line-variant'">
								<option :value="true">
									<span>OHLC</span>
								</option>
								<option :value="false">
									<span>Line</span>
								</option>
							</b-select>
						</b-field>
					</b-tooltip>
				</div>
				<div class="column">
				</div>
				<div class="column is-narrow">
					<button class="button" :class="{'is-primary':brushing}" @click="brushing=!brushing">
						<b-icon type="" icon="crop"></b-icon>
					</button>
				</div>
			</div>
		</section>

		<!-- <b-tooltip type="is-primary" label="Hold click down, then drag to crop" animated> -->
		<!-- <hr> -->
		<hr>
		<v-symbol-echart class="flex-col-full" ref="symbol_vechart" :quote="quote" :brushing="brushing"></v-symbol-echart>
		<!-- </b-tooltip> -->
		

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
