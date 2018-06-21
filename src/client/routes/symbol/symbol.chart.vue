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
								<b-select v-model="axis" :icon="{'category':'reorder-vertical','time':'av-timer'}[axis]" expanded>
									<option :value="'category'">
										<span>Linear</span>
									</option>
									<option :value="'time'">
										<span>Time</span>
									</option>
								</b-select>
							</b-field>
							<b-field label="Chart Type">
								<b-select v-model="ohlc" :icon="ohlc?'poll':'chart-line-variant'" expanded>
									<option :value="true">
										<span>OHLC</span>
									</option>
									<option :value="false">
										<span>Line</span>
									</option>
								</b-select>
							</b-field>
						</b-dropdown-item>
					</b-dropdown>
				</div>

				<div class="column is-narrow">
					<b-field>
						<b-radio-button :class="{'is-loading':busy&&range==v}" v-model="range" type="is-primary" :disabled="busy"
						    v-for="v in ranges" :native-value="v" :key="v">
							<span>{{vcapitalize(v)}}</span>
						</b-radio-button>
					</b-field>
				</div>
				<div class="column is-narrow">
					<b-tooltip :active="isbrushing" label="Click and drag chart area to crop" animated>
						<button class="button" :class="{'is-primary':isbrushing}" @click="isbrushing=!isbrushing">
							<b-icon type="" icon="crop"></b-icon>
						</button>
					</b-tooltip>
				</div>
			</div>
		</section>

		<!-- <section class="flex-col-full overflow-y-auto"> -->
		<v-symbol-echart class="flex-col-full" ref="symbol_vechart" :quote="quote" :range="range" :axis="axis"
		    :isbrushing.sync="isbrushing"></v-symbol-echart>
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
